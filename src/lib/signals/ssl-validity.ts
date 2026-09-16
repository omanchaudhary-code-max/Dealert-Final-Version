import tls from 'tls'
import { logger } from '@/lib/logger'
import type { SignalResult } from '@/types/trust'

export function checkSslValidity(domain: string): Promise<SignalResult> {
  const base: Omit<SignalResult, 'score' | 'detail' | 'available'> = {
    name: 'SSL certificate validity',
    weight: 15,
  }

  return new Promise((resolve) => {
    let socket: tls.TLSSocket

    const timeout = setTimeout(() => {
      if (socket) socket.destroy()
      resolve({ ...base, score: 0, detail: 'SSL check timed out', available: false })
    }, 5000)

    try {
      socket = tls.connect(443, domain, { servername: domain, timeout: 5000 }, () => {
        clearTimeout(timeout)
        try {
          const cert = socket.getPeerCertificate()
          const now = Date.now()
          const validTo = new Date(cert.valid_to).getTime()
          const validFrom = new Date(cert.valid_from).getTime()
          const isValid = socket.authorized && now >= validFrom && now <= validTo

          const issuerOrg = Array.isArray(cert.issuer?.O)
            ? cert.issuer.O.join(', ')
            : cert.issuer?.O ?? 'unknown issuer'

          socket.end()
          resolve({
            ...base,
            score: isValid ? 100 : 20,
            detail: isValid
              ? `Valid, issued by ${issuerOrg}`
              : `Invalid or expired (authorized: ${socket.authorized})`,
            available: true,
          })
        } catch (err) {
          socket.end()
          logger.warn('SSL parse failed', { domain, err: err instanceof Error ? err.message : err })
          resolve({ ...base, score: 0, detail: 'Could not parse certificate', available: false })
        }
      })

      socket.on('error', (err) => {
        clearTimeout(timeout)
        logger.warn('SSL connection failed', { domain, err: err.message })
        resolve({ ...base, score: 0, detail: 'No valid SSL/TLS connection', available: false })
      })
    } catch (err) {
      clearTimeout(timeout)
      logger.warn('SSL connect exception', { domain, err: err instanceof Error ? err.message : err })
      resolve({ ...base, score: 0, detail: 'Could not establish TLS connection', available: false })
    }
  })
}
