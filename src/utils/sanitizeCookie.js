export default function sanitizeCookie(cookie: string): string {
    return cookie.replace(/(.*)(?:;[^=]+;)(.*)/, '$1;$2')
}
