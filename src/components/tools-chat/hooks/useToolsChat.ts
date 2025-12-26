'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ToolsChatMessage, ToolResult, ToolType, UseToolsChatReturn, ChatAttachment } from '../types';
import { WELCOME_MESSAGE, FOLLOW_UP_SUGGESTIONS, TOOL_CONFIGS } from '../constants';
import { calculateMarginOfError, calculateRequiredSampleSize } from '@/lib/utils';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Detect tool type from user message
function detectToolType(message: string): ToolType | null {
  const lower = message.toLowerCase();

  // MOE keywords
  if (lower.includes('margin of error') || lower.includes('moe') ||
      (lower.includes('precision') && lower.includes('sample'))) {
    return 'moe';
  }

  // Sample size keywords
  if (lower.includes('sample size') || lower.includes('how many respondents') ||
      lower.includes('required sample')) {
    return 'sample';
  }

  // MaxDiff keywords
  if (lower.includes('maxdiff') || lower.includes('max diff') ||
      lower.includes('best-worst') || lower.includes('best worst')) {
    return 'maxdiff';
  }

  // LOI keywords
  if (lower.includes('loi') || lower.includes('length of interview') ||
      lower.includes('survey length') || lower.includes('survey duration') ||
      lower.includes('how long')) {
    return 'loi';
  }

  // Demographics keywords
  if (lower.includes('demograph') || lower.includes('quota') ||
      lower.includes('distribution') || lower.includes('census')) {
    return 'demographics';
  }

  // Feasibility keywords
  if (lower.includes('feasibil') || lower.includes('achievable') ||
      lower.includes('risk') || lower.includes('timeline')) {
    return 'feasibility';
  }

  return null;
}

// Extract numbers from user message
function extractNumbers(message: string): number[] {
  const matches = message.match(/\d+(?:\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

// Calculate MOE
function calculateMOE(sampleSize: number, confidenceLevel: number, population?: number): ToolResult {
  const z = confidenceLevel === 99 ? 2.576 : confidenceLevel === 90 ? 1.645 : 1.96;
  let moe = (z * Math.sqrt(0.25 / sampleSize)) * 100;

  // Finite population correction
  if (population && population > 0 && sampleSize < population) {
    const fpc = Math.sqrt((population - sampleSize) / (population - 1));
    moe *= fpc;
  }

  moe = Math.round(moe * 10) / 10;

  // Quality assessment
  let quality: ToolResult['quality'] = 'poor';
  if (moe <= 3) quality = 'excellent';
  else if (moe <= 5) quality = 'good';
  else if (moe <= 7) quality = 'acceptable';

  return {
    toolType: 'moe',
    inputs: { sampleSize, confidenceLevel, population },
    outputs: { marginOfError: moe, quality },
    summary: `With n=${sampleSize.toLocaleString()} and ${confidenceLevel}% confidence, your margin of error is **±${moe}%**`,
    details: [
      { label: 'Sample Size', value: sampleSize.toLocaleString() },
      { label: 'Confidence Level', value: `${confidenceLevel}%` },
      { label: 'Margin of Error', value: `±${moe}%`, highlight: true },
      { label: 'Quality', value: quality.charAt(0).toUpperCase() + quality.slice(1) },
    ],
    recommendations: moe > 5 ? [
      `For better precision, consider increasing sample to ${Math.ceil(384 * (z / 1.96) ** 2)} for ±5% MOE`,
      'Current MOE is suitable for exploratory research',
    ] : [
      'This precision is suitable for most quantitative studies',
      `You can reliably analyze up to ${Math.floor(sampleSize / 100)} subgroups`,
    ],
    quality,
  };
}

// Calculate sample size
function calculateSampleSize(marginOfError: number, confidenceLevel: number, population?: number): ToolResult {
  const z = confidenceLevel === 99 ? 2.576 : confidenceLevel === 90 ? 1.645 : 1.96;
  const moeDecimal = marginOfError / 100;
  let n = Math.ceil((z ** 2 * 0.25) / (moeDecimal ** 2));

  // Finite population correction
  if (population && population > 0) {
    n = Math.ceil((n * population) / (n + population - 1));
  }

  return {
    toolType: 'sample',
    inputs: { marginOfError, confidenceLevel, population },
    outputs: { requiredSample: n },
    summary: `To achieve **±${marginOfError}%** MOE with ${confidenceLevel}% confidence, you need **n=${n.toLocaleString()}** respondents`,
    details: [
      { label: 'Required Sample', value: n.toLocaleString(), highlight: true },
      { label: 'Target MOE', value: `±${marginOfError}%` },
      { label: 'Confidence Level', value: `${confidenceLevel}%` },
      { label: 'Subgroup Capacity', value: Math.floor(n / 100) },
    ],
    recommendations: [
      `Add 10-15% buffer for quality screening (target: ${Math.ceil(n * 1.15).toLocaleString()})`,
      n > 1000 ? 'Consider phased approach for large samples' : 'Sample size is manageable for most panels',
    ],
  };
}

// Calculate MaxDiff design
function calculateMaxDiff(numAttributes: number, numShown: number, sampleSize: number): ToolResult {
  const recommendedTasks = Math.ceil((3 * numAttributes) / numShown);
  const timesShown = (recommendedTasks * numShown) / numAttributes;
  const totalComparisons = recommendedTasks * (numShown - 1) * 2;

  let reliability: 'high' | 'medium' | 'low' = 'low';
  if (timesShown >= 3 && sampleSize >= 200) reliability = 'high';
  else if (timesShown >= 2 && sampleSize >= 100) reliability = 'medium';

  const quality: ToolResult['quality'] =
    reliability === 'high' ? 'excellent' :
    reliability === 'medium' ? 'good' : 'poor';

  return {
    toolType: 'maxdiff',
    inputs: { numAttributes, numShown, sampleSize },
    outputs: { recommendedTasks, timesShown, reliability, totalComparisons },
    summary: `For ${numAttributes} attributes with ${numShown} shown per task: **${recommendedTasks} tasks** recommended`,
    details: [
      { label: 'Recommended Tasks', value: recommendedTasks, highlight: true },
      { label: 'Times Each Shown', value: timesShown.toFixed(1) },
      { label: 'Total Comparisons', value: totalComparisons },
      { label: 'Reliability', value: reliability.toUpperCase() },
    ],
    recommendations: [
      reliability !== 'high' && sampleSize < 200 ? 'Increase sample to 200+ for reliable utilities' : null,
      timesShown < 3 ? 'Consider adding more tasks for better coverage' : null,
      `Survey burden: ~${Math.round(recommendedTasks * 15 / 60)} minutes for MaxDiff section`,
    ].filter(Boolean) as string[],
    quality,
  };
}

// Calculate LOI
function calculateLOI(
  singleChoice: number,
  multipleChoice: number,
  matrixQuestions: number,
  matrixRows: number,
  openEnds: number
): ToolResult {
  // Time estimates in seconds
  const singleTime = singleChoice * 15;
  const multiTime = multipleChoice * 30;
  const matrixTime = matrixQuestions * matrixRows * 9;
  const openTime = openEnds * 90;
  const overhead = 60; // intro/outro

  const totalSeconds = singleTime + multiTime + matrixTime + openTime + overhead;
  const estimatedLOI = Math.round(totalSeconds / 60);
  const minLOI = Math.max(1, Math.round(estimatedLOI * 0.8));
  const maxLOI = Math.round(estimatedLOI * 1.3);

  // Cost tier
  let costTier = 'Standard';
  if (estimatedLOI <= 5) costTier = 'Low';
  else if (estimatedLOI <= 10) costTier = 'Standard';
  else if (estimatedLOI <= 15) costTier = 'Medium';
  else if (estimatedLOI <= 20) costTier = 'High';
  else costTier = 'Premium';

  // Dropout risk
  const dropoutRisk = estimatedLOI > 20 ? 'high' : estimatedLOI > 15 ? 'medium' : 'low';

  const quality: ToolResult['quality'] =
    dropoutRisk === 'low' ? 'excellent' :
    dropoutRisk === 'medium' ? 'acceptable' : 'poor';

  return {
    toolType: 'loi',
    inputs: { singleChoice, multipleChoice, matrixQuestions, matrixRows, openEnds },
    outputs: { estimatedLOI, minLOI, maxLOI, costTier, dropoutRisk },
    summary: `Estimated survey length: **${estimatedLOI} minutes** (${minLOI}-${maxLOI} range)`,
    details: [
      { label: 'Estimated LOI', value: `${estimatedLOI} min`, highlight: true },
      { label: 'Range', value: `${minLOI}-${maxLOI} min` },
      { label: 'Cost Tier', value: costTier },
      { label: 'Dropout Risk', value: dropoutRisk.toUpperCase() },
    ],
    recommendations: [
      dropoutRisk === 'high' ? 'Consider reducing survey length to improve completion rates' : null,
      openEnds > 3 ? 'Reduce open-ends to minimize respondent fatigue' : null,
      matrixQuestions > 5 ? 'Split matrix questions across multiple screens' : null,
      `Budget ~$${(estimatedLOI * 1.5).toFixed(0)}/respondent for online panel`,
    ].filter(Boolean) as string[],
    quality,
  };
}

// Calculate demographics/quotas
function calculateDemographics(totalSample: number, country: string, quotaType: string): ToolResult {
  // Census data (simplified)
  const censusData: Record<string, { male: number; female: number; age18_34: number; age35_54: number; age55plus: number }> = {
    turkey: { male: 50, female: 50, age18_34: 35, age35_54: 35, age55plus: 30 },
    uk: { male: 49, female: 51, age18_34: 28, age35_54: 34, age55plus: 38 },
    usa: { male: 49, female: 51, age18_34: 30, age35_54: 32, age55plus: 38 },
    germany: { male: 49, female: 51, age18_34: 25, age35_54: 35, age55plus: 40 },
    france: { male: 48, female: 52, age18_34: 27, age35_54: 33, age55plus: 40 },
  };

  const data = censusData[country] || censusData.turkey;

  const quotas = quotaType === 'equal' ? {
    male: 50, female: 50, age18_34: 33, age35_54: 33, age55plus: 34
  } : data;

  const genderQuotas = [
    { category: 'Male', percentage: quotas.male, count: Math.round(totalSample * quotas.male / 100) },
    { category: 'Female', percentage: quotas.female, count: Math.round(totalSample * quotas.female / 100) },
  ];

  const ageQuotas = [
    { category: '18-34', percentage: quotas.age18_34, count: Math.round(totalSample * quotas.age18_34 / 100) },
    { category: '35-54', percentage: quotas.age35_54, count: Math.round(totalSample * quotas.age35_54 / 100) },
    { category: '55+', percentage: quotas.age55plus, count: Math.round(totalSample * quotas.age55plus / 100) },
  ];

  return {
    toolType: 'demographics',
    inputs: { totalSample, country, quotaType },
    outputs: { genderQuotas, ageQuotas },
    summary: `Quota distribution for **n=${totalSample.toLocaleString()}** in **${country.charAt(0).toUpperCase() + country.slice(1)}** (${quotaType})`,
    details: [
      { label: 'Total Sample', value: totalSample.toLocaleString(), highlight: true },
      { label: 'Male', value: `${genderQuotas[0].count} (${genderQuotas[0].percentage}%)` },
      { label: 'Female', value: `${genderQuotas[1].count} (${genderQuotas[1].percentage}%)` },
      { label: '18-34', value: `${ageQuotas[0].count} (${ageQuotas[0].percentage}%)` },
      { label: '35-54', value: `${ageQuotas[1].count} (${ageQuotas[1].percentage}%)` },
      { label: '55+', value: `${ageQuotas[2].count} (${ageQuotas[2].percentage}%)` },
    ],
    recommendations: [
      'All demographic cells have sufficient sample for analysis',
      quotaType === 'census' ? 'Census-representative quotas applied' : 'Equal split quotas applied',
    ],
    quality: 'good',
  };
}

// Calculate feasibility
function calculateFeasibility(
  sampleSize: number,
  countries: number,
  loi: number,
  timeline: number,
  incidenceRate: number
): ToolResult {
  // Calculate scores
  const sampleScore = sampleSize <= 500 ? 100 : sampleSize <= 1000 ? 80 : sampleSize <= 2000 ? 60 : 40;
  const loiScore = loi <= 10 ? 100 : loi <= 15 ? 80 : loi <= 20 ? 60 : 40;
  const timelineScore = timeline >= 14 ? 100 : timeline >= 10 ? 80 : timeline >= 7 ? 60 : 40;
  const incidenceScore = incidenceRate >= 80 ? 100 : incidenceRate >= 50 ? 80 : incidenceRate >= 30 ? 60 : 40;
  const countryScore = countries <= 1 ? 100 : countries <= 3 ? 80 : countries <= 5 ? 60 : 40;

  const overallScore = Math.round(
    (sampleScore * 0.25 + loiScore * 0.2 + timelineScore * 0.25 + incidenceScore * 0.2 + countryScore * 0.1)
  );

  const verdict = overallScore >= 70 ? 'green' : overallScore >= 50 ? 'yellow' : 'red';
  const verdictLabel = verdict === 'green' ? 'ACHIEVABLE' : verdict === 'yellow' ? 'PROCEED WITH CAUTION' : 'HIGH RISK';

  // Estimate days needed
  const dailyCapacity = 50 * (incidenceRate / 100);
  const estimatedDays = Math.ceil(sampleSize * countries / dailyCapacity);

  const quality: ToolResult['quality'] =
    verdict === 'green' ? 'excellent' :
    verdict === 'yellow' ? 'acceptable' : 'poor';

  return {
    toolType: 'feasibility',
    inputs: { sampleSize, countries, loi, timeline, incidenceRate },
    outputs: { overallScore, verdict, estimatedDays },
    summary: `Feasibility Score: **${overallScore}/100** - ${verdictLabel}`,
    details: [
      { label: 'Overall Score', value: `${overallScore}/100`, highlight: true },
      { label: 'Verdict', value: verdictLabel },
      { label: 'Estimated Days', value: estimatedDays },
      { label: 'Sample Score', value: `${sampleScore}/100` },
      { label: 'LOI Score', value: `${loiScore}/100` },
      { label: 'Timeline Score', value: `${timelineScore}/100` },
    ],
    recommendations: [
      estimatedDays > timeline ? `⚠️ Timeline risk: Need ${estimatedDays} days, only ${timeline} available` : null,
      incidenceRate < 50 ? 'Low incidence may require extended field time' : null,
      loi > 15 ? 'Consider shortening LOI to improve data quality' : null,
      verdict === 'green' ? '✓ Project parameters are within normal ranges' : null,
    ].filter(Boolean) as string[],
    quality,
  };
}

// Session storage key for welcome message
const WELCOME_SHOWN_KEY = 'calculators_welcome_shown';

export function useToolsChat(): UseToolsChatReturn {
  const [messages, setMessages] = useState<ToolsChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeToolForm, setActiveToolForm] = useState<ToolType | null>(null);
  const [activeFormMessageId, setActiveFormMessageId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  // Initialize - only show welcome on fresh session (not after navigation)
  useEffect(() => {
    if (!isInitialized) {
      // Check if welcome was already shown this session
      const welcomeShown = sessionStorage.getItem(WELCOME_SHOWN_KEY);

      if (!welcomeShown) {
        // First time in this session - show welcome
        setMessages([{
          id: generateId(),
          role: 'assistant',
          content: WELCOME_MESSAGE,
          timestamp: new Date().toISOString(),
        }]);
        sessionStorage.setItem(WELCOME_SHOWN_KEY, 'true');
      }
      // If welcome was already shown, start with empty messages

      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Generate AI response
  const generateResponse = useCallback((
    userMessage: string,
    toolResult?: ToolResult
  ): ToolsChatMessage => {
    if (toolResult) {
      return {
        id: generateId(),
        role: 'assistant',
        content: toolResult.summary,
        timestamp: new Date().toISOString(),
        toolResult,
        suggestions: FOLLOW_UP_SUGGESTIONS[toolResult.toolType] || [],
      };
    }

    // Detect tool type from message
    const detectedTool = detectToolType(userMessage);

    if (detectedTool) {
      const config = TOOL_CONFIGS[detectedTool];
      return {
        id: generateId(),
        role: 'assistant',
        content: `I'll help you with **${config.name}**. Please provide the following information:`,
        timestamp: new Date().toISOString(),
        showToolForm: detectedTool,
      };
    }

    // Generic response
    return {
      id: generateId(),
      role: 'assistant',
      content: `I can help you with research calculations. Please select a tool or describe what you need:\n\n• **Margin of Error** - Calculate precision\n• **Sample Size** - Required respondents\n• **MaxDiff** - Best-worst scaling design\n• **LOI** - Survey length estimation\n• **Demographics** - Quota setup\n• **Feasibility** - Project assessment`,
      timestamp: new Date().toISOString(),
      suggestions: [
        'Calculate margin of error for n=500',
        'What sample size for ±3% MOE?',
        'Design MaxDiff with 12 attributes',
      ],
    };
  }, []);

  // Send message
  const sendMessage = useCallback((content: string, attachments?: ChatAttachment[]) => {
    const hasContent = content.trim();
    const hasAttachments = attachments && attachments.length > 0;

    // Allow sending if there's content OR attachments
    if ((!hasContent && !hasAttachments) || isStreaming) return;

    const userMessage: ToolsChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      attachments: hasAttachments ? attachments : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);
    setActiveToolForm(null);

    // Simulate AI thinking
    setTimeout(() => {
      const response = generateResponse(content);

      // If response has a tool form, prepare default values
      let defaults: Record<string, unknown> = {};
      if (response.showToolForm) {
        const config = TOOL_CONFIGS[response.showToolForm];
        config.fields.forEach(field => {
          if (field.defaultValue !== undefined) {
            defaults[field.name] = field.defaultValue;
          }
        });
        setFormValues(defaults);
      }

      // Add message with formValues for persistence
      setMessages(prev => [...prev, {
        ...response,
        isStreaming: true,
        formValues: response.showToolForm ? { ...defaults } : undefined,
      }]);

      if (response.showToolForm) {
        setActiveToolForm(response.showToolForm);
        setActiveFormMessageId(response.id);
      }

      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === response.id ? { ...msg, isStreaming: false } : msg
        ));
        setIsStreaming(false);
      }, 800);
    }, 500);
  }, [isStreaming, generateResponse]);

  // Submit tool form
  const submitToolForm = useCallback((toolType: ToolType, values: Record<string, unknown>) => {
    // Get tool config for defaults
    const config = TOOL_CONFIGS[toolType];

    // Build final values - start with defaults to ensure we always have values
    const valuesToSubmit: Record<string, unknown> = {};

    // 1. First, add all defaults from config
    config.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        valuesToSubmit[field.name] = field.defaultValue;
      }
    });

    // 2. Override with current formValues from hook state
    Object.keys(formValues).forEach(key => {
      if (formValues[key] !== undefined && formValues[key] !== '') {
        valuesToSubmit[key] = formValues[key];
      }
    });

    // 3. Override with passed values (from form submission)
    Object.keys(values).forEach(key => {
      if (values[key] !== undefined && values[key] !== '') {
        valuesToSubmit[key] = values[key];
      }
    });

    // 4. Find the message and update with submitted values
    setMessages(prev => {
      const newMessages = [...prev];
      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].showToolForm === toolType && !newMessages[i].submittedValues) {
          // Also include message's stored formValues
          const msgFormValues = newMessages[i].formValues || {};
          Object.keys(msgFormValues).forEach(key => {
            if (valuesToSubmit[key] === undefined && msgFormValues[key] !== undefined) {
              valuesToSubmit[key] = msgFormValues[key];
            }
          });
          // Set submitted values on this message
          newMessages[i] = { ...newMessages[i], submittedValues: { ...valuesToSubmit } };
          break;
        }
      }
      return newMessages;
    });

    setIsStreaming(true);
    setActiveToolForm(null);
    setActiveFormMessageId(null);

    // Calculate result based on tool type - use valuesToSubmit which has all merged values
    let result: ToolResult;

    switch (toolType) {
      case 'moe':
        result = calculateMOE(
          Number(valuesToSubmit.sampleSize),
          Number(valuesToSubmit.confidenceLevel) || 95,
          valuesToSubmit.populationSize ? Number(valuesToSubmit.populationSize) : undefined
        );
        break;
      case 'sample':
        result = calculateSampleSize(
          Number(valuesToSubmit.marginOfError),
          Number(valuesToSubmit.confidenceLevel) || 95,
          valuesToSubmit.populationSize ? Number(valuesToSubmit.populationSize) : undefined
        );
        break;
      case 'maxdiff':
        result = calculateMaxDiff(
          Number(valuesToSubmit.numAttributes),
          Number(valuesToSubmit.numShown),
          Number(valuesToSubmit.sampleSize)
        );
        break;
      case 'loi':
        result = calculateLOI(
          Number(valuesToSubmit.singleChoice) || 0,
          Number(valuesToSubmit.multipleChoice) || 0,
          Number(valuesToSubmit.matrixQuestions) || 0,
          Number(valuesToSubmit.matrixRows) || 5,
          Number(valuesToSubmit.openEnds) || 0
        );
        break;
      case 'demographics':
        result = calculateDemographics(
          Number(valuesToSubmit.totalSample),
          String(valuesToSubmit.country) || 'turkey',
          String(valuesToSubmit.quotaType) || 'census'
        );
        break;
      case 'feasibility':
        result = calculateFeasibility(
          Number(valuesToSubmit.sampleSize),
          Number(valuesToSubmit.countries) || 1,
          Number(valuesToSubmit.loi),
          Number(valuesToSubmit.timeline),
          Number(valuesToSubmit.incidenceRate) || 100
        );
        break;
      default:
        return;
    }

    setTimeout(() => {
      const response = generateResponse('', result);
      setMessages(prev => [...prev, { ...response, isStreaming: true }]);

      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === response.id ? { ...msg, isStreaming: false } : msg
        ));
        setIsStreaming(false);
      }, 1000);
    }, 300);
  }, [generateResponse, formValues]);

  // Update form value - store both in formValues state AND on the message
  const updateFormValue = useCallback((field: string, value: unknown) => {
    setFormValues(prev => ({ ...prev, [field]: value }));

    // Also update the message's formValues for persistence
    if (activeFormMessageId) {
      setMessages(prev => prev.map(msg =>
        msg.id === activeFormMessageId
          ? { ...msg, formValues: { ...(msg.formValues || {}), [field]: value } }
          : msg
      ));
    }
  }, [activeFormMessageId]);

  // Clear chat - also clears session storage to show welcome again
  const clearChat = useCallback(() => {
    sessionStorage.removeItem(WELCOME_SHOWN_KEY);
    setMessages([{
      id: generateId(),
      role: 'assistant',
      content: WELCOME_MESSAGE,
      timestamp: new Date().toISOString(),
    }]);
    setActiveToolForm(null);
    setActiveFormMessageId(null);
    setFormValues({});
    setIsStreaming(false);
  }, []);

  // Select tool directly
  const selectTool = useCallback((toolType: ToolType) => {
    const config = TOOL_CONFIGS[toolType];
    setIsStreaming(true);

    // Set default values
    const defaults: Record<string, unknown> = {};
    config.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      }
    });
    setFormValues(defaults);

    const messageId = generateId();
    const message: ToolsChatMessage = {
      id: messageId,
      role: 'assistant',
      content: `Let's calculate using **${config.name}**. Fill in the values below:`,
      timestamp: new Date().toISOString(),
      showToolForm: toolType,
      isStreaming: true,
      formValues: { ...defaults }, // Store defaults on message for persistence
    };

    setMessages(prev => [...prev, message]);

    // Simulate typing animation then show form
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, isStreaming: false } : msg
      ));
      setActiveToolForm(toolType);
      setActiveFormMessageId(messageId);
      setIsStreaming(false);
    }, 600);
  }, []);

  return {
    messages,
    isStreaming,
    activeToolForm,
    formValues,
    sendMessage,
    submitToolForm,
    updateFormValue,
    clearChat,
    selectTool,
  };
}
