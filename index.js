const URL = require('url').URL

/* flow-include

type simple = string

type explicit = {
  name?: string,
  email?: string,
  weight?: number,
  platform: string,
  address: string,
  tierCurrency?: string,
  tiers?: Array<rewardTier>
}

type explicitMultiPlatform = {
  name?: string,
  email?: string,
  weight?: number,
  platforms: Array<{
    platform: string,
    address: string
  }>,
  tierCurrency?: string,
  tiers?: Array<rewardTiers>
}

type multiRecipient = {
  recipients: Array<simple|explicit|explicitMultiPlatform>
}

type rewardTier = {
  threshold: number,
  name: string,
  frequency: 'any'|'monthly'|'one-time',
  description": string
}

export type donateSpecType = simple|explicit|multiRecipient|explicitMultiPlatform

*/

const platformMappings = {
  'givethanks.app': 'Thanks',
  'paypal.me': 'PayPal',
  'patreon.com': 'Patreon'
}

function filterValidPlatform(platform /*: any */) /*: boolean */ {
  return (
    typeof platform === 'object' &&
    typeof platform.platform === 'string' &&
    typeof platform.address === 'string'
  )
}

function parsePlatformFromString(string) {
  try {
    string = string.indexOf('://') > -1 ? string : 'https://' + string
    const url = new URL(string)
    return platformMappings[url.hostname] || 'Unknown'
  } catch (err) {}
}

module.exports = function parse(data /*: any */) /*: Object  */ {
  return {
    recipients: getRecipients(data),
    reward: data.reward
  }
}

function getRecipients(data /*: any */) /*: Object  */ {
  // Handle "simple" type
  if (typeof data === 'string') {
    const platform = parsePlatformFromString(data)
    if (!platform) {
      return []
    }
    return [
      {
        weight: 1,
        platforms: [{ platform, address: data }]
      }
    ]
  }

  if (data === null || typeof data !== 'object') return []

  // Handle "explicit" type
  if (typeof data.platform === 'string' && typeof data.address === 'string') {
    return [
      {
        weight: 1,
        name: data.name,
        email: data.email,
        platforms: [
          {
            platform: data.platform,
            address: data.address
          }
        ]
      }
    ]
  }

  // Handle "explicitMultiPlatform" type
  if (Array.isArray(data.platforms)) {
    const platforms = data.platforms.filter(filterValidPlatform).map(({ platform, address }) => {
      return { platform, address }
    })
    return [
      {
        weight: 1,
        name: data.name,
        email: data.email,
        platforms
      }
    ]
  }

  // Handle "multiRecipient" type
  if (Array.isArray(data.recipients)) {
    const recipients = data.recipients
      .map(recipient => {
        if (typeof recipient === 'string') {
          const platform = parsePlatformFromString(recipient)
          if (!platform) {
            return null
          }
          return [
            {
              weight: 1,
              platforms: [{ platform, address: data }]
            }
          ]
        }

        const weight = recipient.weight ? parseFloat(recipient.weight) : 1

        // Recipient has only a single platform
        if (filterValidPlatform(recipient)) {
          return {
            weight,
            name: recipient.name,
            email: recipient.email,
            platforms: [
              {
                platform: recipient.platform,
                address: recipient.address
              }
            ]
          }
        }

        // Recipient has multiple platforms
        if (typeof recipient === 'object' && Array.isArray(recipient.platforms)) {
          const platforms = recipient.platforms
            .filter(filterValidPlatform)
            .map(({ platform, address }) => {
              return { platform, address }
            })
          return {
            weight,
            name: recipient.name,
            email: recipient.email,
            platforms
          }
        }

        return null
      })
      .filter(recipient => recipient !== null)

    //Normalize weights
    const totalWeight = recipients.reduce((total, { weight }) => total + weight, 0)
    recipients.forEach(recipient => (recipient.weight = recipient.weight / totalWeight))
    return recipients
  }

  // Spec was invalid
  return []
}
