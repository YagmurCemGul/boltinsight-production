# BoltInsight Design System & Style Guide
### Version 1.0 | December 2024

---

## Table of Contents
1. [Brand Colors](#1-brand-colors)
2. [Semantic Colors](#2-semantic-colors)
3. [Light Mode Theme](#3-light-mode-theme)
4. [Dark Mode Theme](#4-dark-mode-theme)
5. [Typography](#5-typography)
6. [Spacing System](#6-spacing-system)
7. [Border Radius](#7-border-radius)
8. [Shadows & Effects](#8-shadows--effects)
9. [Components](#9-components)
10. [Icons](#10-icons)
11. [Responsive Breakpoints](#11-responsive-breakpoints)
12. [Animations](#12-animations)
13. [Logo & Brand Assets](#13-logo--brand-assets)

---

## 1. Brand Colors

### Purple (Primary Brand)
| Name | HEX | RGB | Usage |
|------|-----|-----|-------|
| Purple 900 | `#100E28` | rgb(16, 14, 40) | Darkest purple, dark mode background |
| Purple 800 | `#1A163C` | rgb(26, 22, 60) | Dark mode cards, sidebar |
| Purple 700 | `#231E51` | rgb(35, 30, 81) | Dark mode borders, text on light |
| Purple 600 | `#5B50BD` | rgb(91, 80, 189) | **Main brand color**, buttons, links |
| Purple 500 | `#918AD3` | rgb(145, 138, 211) | Hover states, focus rings |
| Purple 400 | `#C8C4E9` | rgb(200, 196, 233) | Light borders, dividers |

### Teal (Secondary Brand)
| Name | HEX | RGB | Usage |
|------|-----|-----|-------|
| Teal 900 | `#0E6B5D` | rgb(14, 107, 93) | Success text dark |
| Teal 800 | `#14A08C` | rgb(20, 160, 140) | Success hover |
| Teal 600 | `#1ED6BB` | rgb(30, 214, 187) | **Main success color** |
| Teal 400 | `#73EBD9` | rgb(115, 235, 217) | Success light |
| Teal 200 | `#A1F1E6` | rgb(161, 241, 230) | Success background light |
| Teal 100 | `#D0F8F2` | rgb(208, 248, 242) | Success background lightest |

### Red (Accent/Danger)
| Name | HEX | RGB | Usage |
|------|-----|-----|-------|
| Red 900 | `#860E24` | rgb(134, 14, 36) | Danger text dark |
| Red 800 | `#CA1636` | rgb(202, 22, 54) | Danger hover |
| Red 600 | `#EB3F5F` | rgb(235, 63, 95) | **Main danger color** |
| Red 400 | `#F38B9F` | rgb(243, 139, 159) | Danger light |
| Red 200 | `#F7B2BF` | rgb(247, 178, 191) | Danger background light |
| Red 100 | `#FBD8DF` | rgb(251, 216, 223) | Danger background lightest |

### Neutral Grays
| Name | HEX | RGB | Usage |
|------|-----|-----|-------|
| Gray 900 | `#232323` | rgb(35, 35, 35) | Darkest text |
| Gray 700 | `#393939` | rgb(57, 57, 57) | Dark text |
| Gray 600 | `#5A5A5A` | rgb(90, 90, 90) | Muted text |
| Gray 500 | `#919191` | rgb(145, 145, 145) | Placeholder text |
| Gray 300 | `#C8C8C8` | rgb(200, 200, 200) | Borders |
| Gray 100 | `#E9E9E9` | rgb(233, 233, 233) | Light backgrounds |

### Slate (Alternative Neutrals)
| Name | HEX | RGB | Usage |
|------|-----|-----|-------|
| Slate 900 | `#252A31` | rgb(37, 42, 49) | Dark backgrounds |
| Slate 800 | `#383F4A` | rgb(56, 63, 74) | Dark cards |
| Slate 600 | `#4B5563` | rgb(75, 85, 99) | Secondary text |
| Slate 500 | `#8C97A8` | rgb(140, 151, 168) | Muted elements |
| Slate 300 | `#B1BAC5` | rgb(177, 186, 197) | Light borders |
| Slate 100 | `#D8DCE2` | rgb(216, 220, 226) | Light backgrounds |

---

## 2. Semantic Colors

### Status Colors
| Status | Color | HEX | Background HEX | Usage |
|--------|-------|-----|----------------|-------|
| Success | Teal | `#1ED6BB` | `#D0F8F2` | Completed, positive actions |
| Warning | Amber | `#FBBF24` | `#FEF3C7` | Caution, pending states |
| Error | Red | `#EB3F5F` | `#FBD8DF` | Errors, destructive actions |
| Info | Purple | `#5B50BD` | `#EDE9F9` | Information, highlights |

### Project Status Colors
| Status | HEX | Background | Usage |
|--------|-----|------------|-------|
| Active | `#1ED6BB` | `#D0F8F2` | Active projects |
| Completed | `#5B50BD` | `#EDE9F9` | Finished projects |
| On Hold | `#FBBF24` | `#FEF3C7` | Paused projects |
| Archived | `#919191` | `#F3F4F6` | Archived items |

---

## 3. Light Mode Theme

### Surface Colors
| Element | HEX | Usage |
|---------|-----|-------|
| Background | `#FFFFFF` | Main page background |
| Surface | `#FFFFFF` | Cards, panels |
| Surface Secondary | `#F6F8F8` | Sidebar, muted areas |
| Border | `#C8C4E9` | Dividers, card borders |
| Input Border | `#C8C4E9` | Form field borders |

### Text Colors
| Element | HEX | Usage |
|---------|-----|-------|
| Primary Text | `#231E51` | Headings, main content |
| Secondary Text | `#5A5A5A` | Descriptions, labels |
| Muted Text | `#919191` | Placeholders, hints |
| Link Text | `#5B50BD` | Clickable links |
| Inverse Text | `#FFFFFF` | Text on dark backgrounds |

### Interactive Colors
| Element | HEX | Usage |
|---------|-----|-------|
| Primary | `#5B50BD` | Buttons, active states |
| Primary Hover | `#4A41A0` | Button hover |
| Secondary | `#F6F8F8` | Secondary buttons |
| Secondary Hover | `#E9E9E9` | Secondary hover |

---

## 4. Dark Mode Theme

### Surface Colors
| Element | HEX | Usage |
|---------|-----|-------|
| Background | `#100E28` | Main page background |
| Surface | `#1A163C` | Cards, panels |
| Surface Secondary | `#1A163C` | Sidebar, muted areas |
| Border | `#231E51` | Dividers, card borders |
| Input Border | `#231E51` | Form field borders |
| Input Background | `#1E293B` | Form field background |

### Text Colors
| Element | HEX | Usage |
|---------|-----|-------|
| Primary Text | `#E9E9E9` | Headings, main content |
| Secondary Text | `#918AD3` | Descriptions, labels |
| Muted Text | `#64748B` | Placeholders, hints |
| Link Text | `#918AD3` | Clickable links |
| Inverse Text | `#100E28` | Text on light backgrounds |

### Interactive Colors
| Element | HEX | Usage |
|---------|-----|-------|
| Primary | `#918AD3` | Buttons, active states |
| Primary Hover | `#A9A4DC` | Button hover |
| Secondary | `#1A163C` | Secondary buttons |
| Secondary Hover | `#231E51` | Secondary hover |

---

## 5. Typography

### Font Family
```
Primary: Montserrat
Fallback: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"

Google Fonts URL:
https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap
```

### Font Weights
| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Labels, buttons |
| Semibold | 600 | Headings, emphasis |
| Bold | 700 | Strong emphasis |

### Type Scale
| Name | Size (px) | Size (rem) | Weight | Line Height | Usage |
|------|-----------|------------|--------|-------------|-------|
| Display | 30px | 1.875rem | 700 | 1.2 | Hero sections |
| Heading 1 | 24px | 1.5rem | 600 | 1.3 | Page titles |
| Heading 2 | 20px | 1.25rem | 600 | 1.35 | Section headers |
| Heading 3 | 18px | 1.125rem | 600 | 1.4 | Subsections |
| Body Large | 16px | 1rem | 500 | 1.5 | Emphasized body |
| Body | 14px | 0.875rem | 400 | 1.5 | Default text |
| Caption | 12px | 0.75rem | 400 | 1.4 | Labels, hints |
| Small | 11px | 0.6875rem | 500 | 1.3 | Badges, tags |

### Text Styles Reference
```
Heading 1:    font-size: 24px; font-weight: 600; line-height: 1.3;
Heading 2:    font-size: 20px; font-weight: 600; line-height: 1.35;
Heading 3:    font-size: 18px; font-weight: 600; line-height: 1.4;
Body Large:   font-size: 16px; font-weight: 500; line-height: 1.5;
Body:         font-size: 14px; font-weight: 400; line-height: 1.5;
Caption:      font-size: 12px; font-weight: 400; line-height: 1.4;
Button:       font-size: 14px; font-weight: 500; line-height: 1;
Badge:        font-size: 12px; font-weight: 500; line-height: 1;
```

---

## 6. Spacing System

### Base Unit: 4px

### Spacing Scale
| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| space-0 | 0 | 0px | No spacing |
| space-1 | 0.25rem | 4px | Tight spacing |
| space-2 | 0.5rem | 8px | Small spacing |
| space-3 | 0.75rem | 12px | Medium-small |
| space-4 | 1rem | 16px | Default spacing |
| space-5 | 1.25rem | 20px | Medium |
| space-6 | 1.5rem | 24px | Large spacing |
| space-8 | 2rem | 32px | Section spacing |
| space-10 | 2.5rem | 40px | Large sections |
| space-12 | 3rem | 48px | Page sections |
| space-16 | 4rem | 64px | Major sections |

### Common Spacing Patterns
```
Card padding:        24px (space-6)
Card gap:            16px (space-4)
Button padding:      12px 16px (space-3 space-4)
Input padding:       8px 12px (space-2 space-3)
Section gap:         24px (space-6)
List item gap:       8px (space-2)
Icon + text gap:     8px (space-2)
Badge padding:       4px 10px (space-1 2.5)
Modal padding:       24px (space-6)
```

### Container Widths
| Name | Width | Usage |
|------|-------|-------|
| max-w-sm | 384px | Small modals |
| max-w-md | 448px | Medium modals |
| max-w-lg | 512px | Large modals |
| max-w-xl | 576px | Extra large |
| max-w-2xl | 672px | Dialogs |
| max-w-4xl | 896px | Wide content |
| max-w-6xl | 1152px | Full content |

---

## 7. Border Radius

### Radius Scale
| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| radius-none | 0 | 0px | No rounding |
| radius-sm | 0.125rem | 2px | Subtle rounding |
| radius-default | 0.25rem | 4px | Small elements |
| radius-md | 0.375rem | 6px | Medium elements |
| radius-lg | 0.5rem | 8px | Buttons, inputs |
| radius-xl | 0.75rem | 12px | Cards, panels |
| radius-2xl | 1rem | 16px | Large cards |
| radius-full | 9999px | Circle | Avatars, badges |

### Common Radius Usage
```
Buttons:       8px (radius-lg)
Inputs:        8px (radius-lg)
Cards:         12px (radius-xl)
Modals:        12px (radius-xl)
Badges:        9999px (radius-full)
Avatars:       9999px (radius-full)
Dropdowns:     8px (radius-lg)
Tooltips:      6px (radius-md)
```

---

## 8. Shadows & Effects

### Box Shadows
| Name | CSS Value | Usage |
|------|-----------|-------|
| Shadow None | none | Flat elements |
| Shadow SM | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Subtle depth |
| Shadow Default | `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)` | Cards |
| Shadow MD | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)` | Hover states |
| Shadow LG | `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)` | Toasts |
| Shadow XL | `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)` | Modals, dropdowns |

### Figma Shadow Values
```
Shadow SM:
  X: 0, Y: 1, Blur: 2, Spread: 0
  Color: #000000, Opacity: 5%

Shadow Default:
  Layer 1: X: 0, Y: 1, Blur: 3, Spread: 0, Color: #000000, Opacity: 10%
  Layer 2: X: 0, Y: 1, Blur: 2, Spread: -1, Color: #000000, Opacity: 10%

Shadow MD:
  Layer 1: X: 0, Y: 4, Blur: 6, Spread: -1, Color: #000000, Opacity: 10%
  Layer 2: X: 0, Y: 2, Blur: 4, Spread: -2, Color: #000000, Opacity: 10%

Shadow LG:
  Layer 1: X: 0, Y: 10, Blur: 15, Spread: -3, Color: #000000, Opacity: 10%
  Layer 2: X: 0, Y: 4, Blur: 6, Spread: -4, Color: #000000, Opacity: 10%

Shadow XL:
  Layer 1: X: 0, Y: 20, Blur: 25, Spread: -5, Color: #000000, Opacity: 10%
  Layer 2: X: 0, Y: 8, Blur: 10, Spread: -6, Color: #000000, Opacity: 10%
```

### Backdrop Blur
| Name | Value | Usage |
|------|-------|-------|
| Blur SM | 4px | Subtle overlay |
| Blur Default | 8px | Modal backdrop |
| Blur LG | 16px | Heavy overlay |

### Overlay Colors
| Name | Value | Usage |
|------|-------|-------|
| Overlay Light | `rgba(0, 0, 0, 0.3)` | Light backdrop |
| Overlay Default | `rgba(0, 0, 0, 0.5)` | Modal backdrop |
| Overlay Dark | `rgba(0, 0, 0, 0.7)` | Heavy overlay |

---

## 9. Components

### Button

#### Variants
| Variant | Background | Text | Border | Hover Background |
|---------|------------|------|--------|------------------|
| Primary | `#5B50BD` | `#FFFFFF` | none | `#4A41A0` |
| Secondary | `#F3F4F6` | `#232323` | none | `#E5E7EB` |
| Outline | transparent | `#5B50BD` | `#C8C4E9` | `#F6F8F8` |
| Ghost | transparent | `#5A5A5A` | none | `#F3F4F6` |
| Destructive | `#EB3F5F` | `#FFFFFF` | none | `#CA1636` |

#### Sizes
| Size | Height | Padding (H) | Font Size | Icon Size |
|------|--------|-------------|-----------|-----------|
| Small | 32px | 12px | 14px | 16px |
| Medium | 40px | 16px | 14px | 18px |
| Large | 48px | 24px | 16px | 20px |
| Icon | 40px | 0 (centered) | - | 20px |

#### States
| State | Style Changes |
|-------|---------------|
| Hover | Background darkens 10% |
| Active | Background darkens 15% |
| Focus | Ring: 2px `#918AD3`, offset 2px |
| Disabled | Opacity: 50%, cursor: not-allowed |

#### Button Specs (Figma)
```
Primary Medium:
  Width: Auto (min 80px)
  Height: 40px
  Padding: 16px horizontal
  Border Radius: 8px
  Background: #5B50BD
  Text: 14px Montserrat Medium, #FFFFFF

Primary Small:
  Height: 32px
  Padding: 12px horizontal

Primary Large:
  Height: 48px
  Padding: 24px horizontal
  Font Size: 16px
```

---

### Card

#### Structure
```
Card Container:
  Background: #FFFFFF (light) / #1A163C (dark)
  Border: 1px solid #E5E7EB (light) / #231E51 (dark)
  Border Radius: 12px
  Shadow: Shadow SM

Card Header:
  Padding: 24px
  Border Bottom: 1px solid #E5E7EB (optional)

Card Content:
  Padding: 24px
  Padding Top: 0 (if header exists)

Card Footer:
  Padding: 24px
  Padding Top: 0
  Border Top: 1px solid #E5E7EB (optional)
```

#### Card Specs (Figma)
```
Default Card:
  Min Width: 280px
  Border Radius: 12px
  Border: 1px solid #E5E7EB
  Background: #FFFFFF
  Shadow: 0 1px 2px rgba(0,0,0,0.05)

  Header:
    Height: Auto
    Padding: 24px

  Content:
    Padding: 0 24px 24px 24px
```

---

### Badge

#### Variants
| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Default | `#F3F4F6` | `#374151` | none |
| Success | `#D0F8F2` | `#0E6B5D` | none |
| Warning | `#FEF3C7` | `#92400E` | none |
| Error | `#FBD8DF` | `#860E24` | none |
| Info | `#EDE9F9` | `#5B50BD` | none |

#### Dark Mode Variants
| Variant | Background | Text |
|---------|------------|------|
| Default | `#374151` | `#E5E7EB` |
| Success | `rgba(22, 101, 52, 0.3)` | `#86EFAC` |
| Warning | `rgba(133, 77, 14, 0.3)` | `#FCD34D` |
| Error | `rgba(153, 27, 27, 0.3)` | `#FCA5A5` |
| Info | `#231E51` | `#918AD3` |

#### Badge Specs (Figma)
```
Badge:
  Height: 22px
  Padding: 4px 10px
  Border Radius: 9999px (full)
  Font: 12px Montserrat Medium
```

---

### Input

#### Default State
```
Input Field:
  Height: 40px
  Padding: 8px 12px
  Border: 1px solid #D1D5DB
  Border Radius: 8px
  Background: #FFFFFF
  Font: 14px Montserrat Regular
  Text Color: #232323
  Placeholder Color: #9CA3AF
```

#### States
| State | Border Color | Background | Other |
|-------|--------------|------------|-------|
| Default | `#D1D5DB` | `#FFFFFF` | - |
| Hover | `#9CA3AF` | `#FFFFFF` | - |
| Focus | `#5B50BD` | `#FFFFFF` | Ring: 2px `#918AD3` |
| Error | `#EB3F5F` | `#FFFFFF` | Ring: 2px `#F38B9F` |
| Disabled | `#E5E7EB` | `#F9FAFB` | Opacity: 50% |

#### Dark Mode
```
Background: #1E293B
Border: #475569
Text: #F1F5F9
Placeholder: #64748B
Focus Ring: #918AD3
```

---

### Textarea

#### Specs
```
Textarea:
  Min Height: 80px
  Padding: 12px
  Border: 1px solid #D1D5DB
  Border Radius: 8px
  Font: 14px Montserrat Regular
  Resize: None

States: Same as Input
```

---

### Select / Dropdown

#### Select Input Specs
```
Select:
  Height: 40px
  Padding: 8px 40px 8px 12px
  Border: 1px solid #D1D5DB
  Border Radius: 8px
  Background: #FFFFFF
  Icon: ChevronDown (right: 12px)
  Icon Size: 16px
  Icon Color: #6B7280
```

#### Dropdown Menu Specs
```
Dropdown Menu:
  Min Width: 160px
  Background: #FFFFFF
  Border: 1px solid #E5E7EB
  Border Radius: 8px
  Shadow: Shadow XL
  Padding: 4px 0

Dropdown Item:
  Height: 36px
  Padding: 8px 12px
  Font: 14px Montserrat Regular
  Text Color: #374151
  Hover Background: #F3F4F6

Dropdown Item Destructive:
  Text Color: #EB3F5F
  Hover Background: #FEF2F2

Dropdown Separator:
  Height: 1px
  Background: #E5E7EB
  Margin: 4px 0
```

---

### Modal / Dialog

#### Sizes
| Size | Max Width |
|------|-----------|
| Small | 384px |
| Medium | 448px |
| Large | 512px |
| XL | 672px |

#### Structure
```
Modal Backdrop:
  Background: rgba(0, 0, 0, 0.5)
  Backdrop Filter: blur(4px)

Modal Container:
  Background: #FFFFFF
  Border Radius: 12px
  Shadow: Shadow XL

Modal Header:
  Padding: 16px 24px
  Border Bottom: 1px solid #E5E7EB

Modal Content:
  Padding: 24px

Modal Footer:
  Padding: 16px 24px
  Border Top: 1px solid #E5E7EB

Close Button:
  Position: Top Right
  Size: 40px x 40px
  Icon: X (24px)
```

---

### Tabs

#### Specs
```
Tab List:
  Border Bottom: 1px solid #E5E7EB
  Gap: 0

Tab Trigger:
  Padding: 8px 16px
  Font: 14px Montserrat Medium

Tab Inactive:
  Text Color: #6B7280
  Border Bottom: 2px solid transparent

Tab Active:
  Text Color: #5B50BD
  Border Bottom: 2px solid #5B50BD

Tab Hover:
  Text Color: #374151
```

---

### Toast / Notification

#### Variants
| Variant | Background | Border | Icon Color | Text Color |
|---------|------------|--------|------------|------------|
| Success | `#ECFDF5` | `#A7F3D0` | `#10B981` | `#065F46` |
| Error | `#FEF2F2` | `#FECACA` | `#EF4444` | `#991B1B` |
| Warning | `#FFFBEB` | `#FDE68A` | `#F59E0B` | `#92400E` |
| Info | `#EDE9F9` | `#C8C4E9` | `#5B50BD` | `#5B50BD` |

#### Specs
```
Toast Container:
  Max Width: 384px
  Padding: 16px
  Border Radius: 8px
  Border: 1px solid
  Shadow: Shadow LG
  Gap: 12px (icon to content)

Toast Icon:
  Size: 20px

Toast Title:
  Font: 14px Montserrat Medium

Toast Description:
  Font: 14px Montserrat Regular

Position: Fixed, Bottom: 16px, Right: 16px
```

---

### Sidebar Navigation

#### Specs
```
Sidebar:
  Width: 240px (desktop)
  Background: #F6F8F8 (light) / #1A163C (dark)
  Border Right: 1px solid #E5E7EB

Nav Item:
  Height: 40px
  Padding: 8px 12px
  Border Radius: 8px
  Gap: 12px (icon to text)
  Font: 14px Montserrat Medium

Nav Item Default:
  Background: transparent
  Text Color: #5A5A5A
  Icon Color: #5A5A5A

Nav Item Hover:
  Background: #E5E7EB

Nav Item Active:
  Background: #EDE9F9
  Text Color: #5B50BD
  Icon Color: #5B50BD
```

---

## 10. Icons

### Icon Library
**Lucide React** (https://lucide.dev)

### Icon Sizes
| Size | Pixels | Usage |
|------|--------|-------|
| XS | 12px | Inline, badges |
| SM | 16px | Buttons small, inputs |
| MD | 18px | Buttons medium |
| Default | 20px | Navigation, cards |
| LG | 24px | Headers, actions |
| XL | 32px | Feature icons |
| 2XL | 48px | Empty states |

### Commonly Used Icons
```
Navigation:
  - Home (home)
  - Projects (folder-kanban)
  - Library (library)
  - Settings (settings)

Actions:
  - Add (plus)
  - Edit (pencil)
  - Delete (trash-2)
  - Search (search)
  - Close (x)
  - Check (check)
  - ChevronDown (chevron-down)
  - ChevronRight (chevron-right)
  - ArrowRight (arrow-right)

Status:
  - CheckCircle (check-circle) - Success
  - AlertCircle (alert-circle) - Error
  - AlertTriangle (alert-triangle) - Warning
  - Info (info) - Information

Features:
  - Architecture (layers)
  - Database (database)
  - API/Globe (globe)
  - Server (server)
  - Layout (layout)
  - FileText (file-text)
  - Users (users)
  - Messages (message-square)
  - Analytics (bar-chart-3)
  - Calculator (calculator)

UI:
  - Moon (moon) - Dark mode
  - Monitor (monitor) - Desktop
  - Smartphone (smartphone) - Mobile
  - Tablet (tablet) - Tablet
  - Menu (menu)
  - MoreVertical (more-vertical)
```

### Icon Stroke Width
Default: 2px (can use 1.5px for lighter feel)

---

## 11. Responsive Breakpoints

### Breakpoint Scale
| Name | Min Width | Usage |
|------|-----------|-------|
| Mobile | 0px | Default, mobile-first |
| SM | 640px | Large phones, small tablets |
| MD | 768px | Tablets |
| LG | 1024px | Small desktops, laptops |
| XL | 1280px | Desktops |
| 2XL | 1536px | Large screens |

### Layout Changes
```
Mobile (< 768px):
  - Single column layout
  - Bottom navigation
  - Full-width cards
  - Collapsed sidebar (overlay)
  - Touch targets: 44px minimum
  - Font size: 16px minimum for inputs

Tablet (768px - 1023px):
  - Two column layouts
  - Side navigation (collapsible)
  - Cards: 2 per row

Desktop (1024px+):
  - Multi-column layouts
  - Persistent sidebar
  - Cards: 3+ per row
  - Hover states enabled
```

### Touch Target Guidelines
```
Mobile:
  - Minimum touch target: 44px x 44px
  - Minimum spacing between targets: 8px
  - Input font size: 16px (prevents iOS zoom)
```

---

## 12. Animations

### Timing Functions
| Name | Value | Usage |
|------|-------|-------|
| Ease | ease | General transitions |
| Ease In | ease-in | Exit animations |
| Ease Out | ease-out | Enter animations |
| Ease In Out | ease-in-out | Symmetric animations |
| Spring | cubic-bezier(0.4, 0, 0.6, 1) | Bouncy feel |

### Duration Scale
| Name | Duration | Usage |
|------|----------|-------|
| Instant | 0ms | No animation |
| Fast | 150ms | Micro-interactions |
| Normal | 200ms | Standard transitions |
| Slow | 300ms | Complex animations |
| Slower | 500ms | Page transitions |

### Common Animations

#### Color Transition
```css
transition: color 200ms ease;
transition: background-color 200ms ease;
transition: border-color 200ms ease;
```

#### Opacity Transition
```css
transition: opacity 200ms ease;
```

#### Transform Transition
```css
transition: transform 200ms ease;
```

#### All Properties
```css
transition: all 300ms ease;
```

### Keyframe Animations

#### Pulse (Loading)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
Duration: 2000ms
Timing: cubic-bezier(0.4, 0, 0.6, 1)
Iteration: infinite
```

#### Slide Up (Mobile Nav)
```css
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
Duration: 300ms
```

#### Slide In (Sidebar)
```css
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
Duration: 300ms
```

#### Bounce (Typing Indicator)
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
Duration: 600ms
Iteration: infinite
```

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
Duration: 200ms
```

---

## 13. Logo & Brand Assets

### Logo Files
| File | Format | Dimensions | Usage |
|------|--------|------------|-------|
| Logo.svg | SVG | Scalable | Primary (web, print) |
| Logo.png | PNG | 241 x 136px | Fallback, social |

### Logo Specifications
```
Aspect Ratio: 1.77:1 (241:136)
Minimum Size: 120px width
Clear Space: 16px minimum around logo

Colors:
  - Light Background: Full color logo
  - Dark Background: Inverted/light version
```

### Brand Name
```
Name: BoltInsight
Font: Montserrat Bold
Tracking: Normal
```

### Logo Usage Guidelines
```
DO:
  - Use provided logo files
  - Maintain aspect ratio
  - Ensure adequate contrast
  - Use appropriate version for background

DON'T:
  - Stretch or distort
  - Add effects or shadows
  - Change colors
  - Place on busy backgrounds
```

### Favicon
```
Sizes needed:
  - 16x16px (favicon.ico)
  - 32x32px (favicon-32.png)
  - 180x180px (apple-touch-icon.png)
  - 192x192px (android-chrome-192.png)
  - 512x512px (android-chrome-512.png)
```

---

## Quick Reference - Figma Import Checklist

### Colors to Create
- [ ] Purple: 900, 800, 700, 600, 500, 400
- [ ] Teal: 900, 800, 600, 400, 200, 100
- [ ] Red: 900, 800, 600, 400, 200, 100
- [ ] Gray: 900, 700, 600, 500, 300, 100
- [ ] Slate: 900, 800, 600, 500, 300, 100
- [ ] Light theme surface colors
- [ ] Dark theme surface colors
- [ ] Semantic colors (success, warning, error, info)

### Text Styles to Create
- [ ] Display
- [ ] Heading 1, 2, 3
- [ ] Body Large, Body, Caption, Small
- [ ] Button text
- [ ] Badge text

### Effect Styles to Create
- [ ] Shadow SM, Default, MD, LG, XL
- [ ] Blur SM, Default, LG

### Components to Create
- [ ] Button (5 variants × 4 sizes × 4 states)
- [ ] Card (with header, content, footer)
- [ ] Badge (5 variants)
- [ ] Input (4 states)
- [ ] Textarea
- [ ] Select
- [ ] Dropdown Menu
- [ ] Modal (4 sizes)
- [ ] Tabs
- [ ] Toast (4 variants)
- [ ] Sidebar Navigation

---

*Generated for BoltInsight Design System*
*Last Updated: December 2024*
