interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 64 }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={size}
      height={size * (136.5 / 241.5)}
      viewBox="0 0 241.5 136.499996"
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <defs>
        <filter x="0%" y="0%" width="100%" height="100%" id="f43839d209">
          <feColorMatrix
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
            colorInterpolationFilters="sRGB"
          />
        </filter>
        <filter x="0%" y="0%" width="100%" height="100%" id="3dca4bd20c">
          <feColorMatrix
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0.2126 0.7152 0.0722 0 0"
            colorInterpolationFilters="sRGB"
          />
        </filter>
        <clipPath id="44512a1f90">
          <path
            d="M 0.191406 0 L 240.808594 0 L 240.808594 136 L 0.191406 136 Z M 0.191406 0 "
            clipRule="nonzero"
          />
        </clipPath>
        <mask id="607baf644f">
          <g filter="url(#f43839d209)">
            <g
              filter="url(#3dca4bd20c)"
              transform="matrix(0.747263, 0, 0, 0.747263, 0.19161, 0)"
            >
              <image
                x="0"
                y="0"
                width="322"
                xlinkHref="data:image/png;base64,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"
                height="182"
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          </g>
        </mask>
      </defs>
      <g clipPath="url(#44512a1f90)">
        <g mask="url(#607baf644f)">
          <g transform="matrix(0.747263, 0, 0, 0.747263, 0.19161, 0)">
            <image
              x="0"
              y="0"
              width="322"
              xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUIAAAC2CAIAAAAjuxNwAAAABmJLR0QA/wD/AP+gvaeTAAAcmklEQVR4nO3d23NcyX0f8O/v1+fMBVcSBHgBMCC4GJAUnUh2ZMmpiuTwwXFK1ookQNGrKtv/hfOaYlUek7yn/JZylOyGEi+rjbdSSapYVrJVWWXLK1viLnHhkgTAy4IESVxn5pzuXx4GJHdJ4jbTZ+YM8Ps8gFzuTE/jTP9On3O6+9eAUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaVUy6J63lzsPwMQQEQ1luMgIDiSL2au1VMTtYuNDp2FIwCQWpurCAASmbh/bXDwQiCOIQZSc5XErf+cfnil5kI84rreTQRIzTEMgEGOhOo7m6jdjsBSewwDICIRYQIQIo6J64lhAMQQB6ovejwK6no3gbjeX8XASH3HVO0BXGePI8bACQCGtFPZkam3QsF6n5wGdR2bevrhr5WjvbHajKfmwQQgIG/Bl57eODUVUUrVSsNYqZanYaxUy9MwVqrlaRgr1fI0jJVqeRrGSrU8DWOlWp6GsVItT8NYqZanYaxUy9MwVqrlaRgr1fI0jJVqeRrGSrU8DWOlWp6GsVItT8NYqZanYaxUy9MwVqrlaRgr1fI0jJVqeRrGSrU8DWOlWp6GsVItT8NYqZanYaxUy9MwVqrlaRgr1fI0jJVqeRrGSrU8DWOlWp6GsVItT8NYqZanYaxUy9MwVqrlaRgr1fI0jJVqeRrGSrU8DWOlWp6GsVItT8NYqZYXNLsCqhGG+3/EIBAxEejlv1f/KrL+J9FX/xkQwKF7jXMRHVmmS7jUwCqrHWj5MO7uHs0E+zryAwwmOEAgLxujMFnC0uq+cjm7tHQYuNjUyjbO6dOnlx7nosisLWeEICLW2QAMIkAIJBAiqh4uAgSg538+L4OInBA9zeL3ntDUQXs8Mw4Qgz+f1XgGACEUC+Mey4tc4MCVOPPw4V/v6J0tFsbFnh8gDECEwBCwWp6fm//fQ0M/ZBfCWQRCDgAciMmJMwzrgiCbffro0bcGD07lM+dQ/f8AwU3MftDMXyYBp0+ffvY4F0dmfo76BpbvTe4HEwAmsHnxXRMAAkHW/46XPfRXemqIgMAgdp8OueqLjbCFHS2MLa3ui+Ls42d76Mz4KgKItn7ZTkoMg3ip1JFBZafvbIEw/va3v11e6rY2jEptEIdSBW25aktsy/WNFsYgAMUwgDAIoOodP5MRAZvItTFGh34NAYGcOIIhRAJTLJwrx7EVt1auPHnyP5v8e9bn+ODbAn40Z3sHVmYm9xPj3vR+YeDFxUk9ZP0PSzEAAXW1P524+62B3lu57I8hwfS9d+v/kBbz/ETok0MHluOdR2Wqw7hQ+EmAeOnJauf+h4v3hiiACFN7rpayZP0HEQMQZAAhkUwmXFhc6s7lewfHhGRq5qrX36ARiofPwpATYbLlUjg3vY9ZAPLdxF4iiAhGBz8VIrFZokpxYEzETd+7lthn7iEB4p2/JY0u9nQ9yISlEEsRwiDKLH5ZqNbU31WMVItjh972TgI5chCMDpwFQOIm7v3C1ycl50T/GUcMgVhBxojQ16+KE0ZEAJkSwVhrQTQyOCaCW3NXGlcHBSBtYXzq1AVbdqsr0zMPRoqFXxNgUEm8aVL1sRgBIsxsY0dBcfDHTsytufeS/ehaHTt4hgxbwIizJiAWiDQ0hl8igWPDAjgHkD02+HaEaHb2vzejMntUesaNpafzvywtnDRZzgXLo4Vff2XQo1Gqz2pNyAwnhtzayKE/eWv/HzWuAtszWhjngMU6MFsTEKQ58ft1BDAjgIkQhZIZ6T/b7BrtISkJYzl84N8tLP0ka/4hXoqb3ShFAMNlDlgqlTKv9HSfaG6FXhgdGh8tjAHChoOMIRL/T1nqUB3LylM7CxNRceCcBnNjpCSM0dn+0WjhPHGCD2Z2iAAynZ1t7QcXnt082PPd4f7zTa2P9HS/u1o69fzxQCp64A0IG2YmEWGm40Pnml2f3a/5Ybw+cCnS0OvnbRJAuDg01pYrVKJTPd3vNqWSF3DhZP7fL3w7J5/O3y4oY2yePjCF/vlH6/939HC+erkllYhBFmfU+eKw28Xiz9odo12rTSEcQsggASjhfF89iNjUBxsUCSfOHaeAvc0S58WbLovpDdCJESOEVhaDU92jjW7PruThvHOhCFVb06PJx/Jx4+NiXMcgsI4jXcc20dE5ZxZMnFeGnwts0doGO8cgwEBioUE+5aRoXPOChgutsl9SiPZfRIziKCR7J2G8Y6RkBBV1wUVC4m0yNGjY9XVRhKl+qnBDlEYsgjYyMjgmWZXZlfRMK4RPf953HefPNh3IY6JiEjI9xqaphMwiAijhV8vr+3b0/Xg8P5/O3y4oY2yePjCF/vlH6/939HC+erkllYhBFmfU+eKw28Xiz9odo12rTSM62Hy7s8BjAycISIREWHi5iySlWp/5AzYkcART97ZbVfRm5uauQbgeOHHAkcQhnPrF7mN+0L2eBiTiIAEURkmE+bzpZWV/P6eTz75q63fmgLTc+8DGBkYX16bfbjw8cn+s9Y08C5JAGYXMEWWyMHx1E5SF+0yEzM/A3CicEZAZBC0hfZZ7EgE5HuXqDeoK4ybcPXgAUGcA5GzJc5mYNlZsIGtfLZVPtp0ql7293aeeFa619E+aMOAK5ZY4JLKcwYWCCZnrw4c+sMcH5TQTHudVf7qB/raIyr5Z1HVWX2nTl1wJYeQEAkIQsxiISQk28nvXcMvW29vXE3plzrVpfeyPjGZRKg6n846ybCxIOcsmUDiCgWzKbv7rc2jpZsA3to3TNYJQyycoyBDcM7D6baaG9NBDJViZB1W1+Z6uk7OPfxbH3XfmtT/aL6Bk9Nv3Hh5UisOnSdxAjpUbv+j+eJ/PPIxhVmzPlWeINVMei/77DCoLovZmbovqgXPs8imiAhenvOq/yEiEBiCFWvo9kxLdrxberHW6tiRcTZwVpgAOBLrXBZkmQgEt+lXVu39RIggYBFBzBXjAiK2VgKmsqMHj3/VoF9pvU4+Lv2a0d9M3V2/0fgzXPy0Y2643HvHPHXEhBfNtJpVXYSIBY5Qw41RusJPJeH44NsiRgCAiQRARzcVTwV/97+W28LcSoezlgCYisAyRaU/X/iD/9E3/TC7DAAkQk4gju3tFlmWtAdpGO9FFy5cuH+rEq3h6RPnQhMbgQVZosgeXdu/L858c23wIi42u5pKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimVdv8fK3p1IOXjRCAAAAAASUVORK5CYII="
              height="182"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
