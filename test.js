const chai = require('chai')
const parse = require('./index.js')
const expect = chai.expect

const describe = global.describe
const it = global.it

describe('parse()', () => {
  it('parses simple specs!', () => {
    const parsed = parse('givethanks.app/u/bobloblaw')
    expect(Array.isArray(parsed)).to.equal(true)
    expect(parsed[0]).to.be.a('object')
    expect(Array.isArray(parsed[0].platforms))
    expect(parsed[0].platforms.length, 'platforms.length').to.equal(1)
  })

  it('parses explicit specs!', () => {
    const parsed = parse({
      platform: 'foo',
      address: 'bar'
    })
    expect(Array.isArray(parsed)).to.equal(true)
    expect(parsed[0]).to.be.a('object')
    expect(Array.isArray(parsed[0].platforms))
    expect(parsed[0].platforms.length, 'platforms.length').to.equal(1)
  })

  it('parses explicitMultiPlatform specs!', () => {
    const parsed = parse({
      platforms: [
        {
          platform: 'foo2',
          address: 'bar2'
        }
      ]
    })
    expect(Array.isArray(parsed)).to.equal(true)
    expect(parsed[0]).to.be.a('object')
    expect(Array.isArray(parsed[0].platforms))
    expect(parsed[0].platforms.length, 'platforms.length').to.equal(1)
  })

  it('parses invalid spec (containing platforms & recipients)!', () => {
    const parsed = parse({
      platforms: [
        {
          platform: 'foo3',
          address: 'bar3'
        }
      ],
      recipients: [
        {
          platform: 'foo4',
          address: 'bar4'
        }
      ]
    })
    expect(Array.isArray(parsed)).to.equal(true)
    expect(parsed[0]).to.be.a('object')
    expect(Array.isArray(parsed[0].platforms))
    expect(parsed[0].platforms.length, 'platforms.length').to.equal(1)
  })

  it('parses invalid spec (number)!', () => {
    const parsed = parse(25)
    expect(Array.isArray(parsed)).to.equal(true)
    expect(parsed.length).to.equal(0)
  })

  it('parses multiRecipient specs!', () => {
    const emailTest = 'multi-recp-email@gmail.com'
    const parsed = parse({
      recipients: [
        { platform: 'foo5', address: 'bar5' },
        {
          email: emailTest,
          platforms: [
            {
              platform: 'foo6',
              address: 'bar6'
            },
            {
              platform: 'foo7',
              address: 'bar7'
            }
          ]
        }
      ]
    })
    expect(Array.isArray(parsed)).to.equal(true)
    expect(parsed[0]).to.be.a('object')
    expect(Array.isArray(parsed[0].platforms))
    expect(parsed[0].platforms.length, 'reply[0].platforms.length').to.equal(1)
    expect(parsed[1].platforms.length, 'reply[1].platforms.length').to.equal(2)
    expect(parsed[1].email, 'reply[1].email').to.equal(emailTest)
  })

  it('normalizes sum of weights to equal 1!', () => {
    const parsed = parse({
      recipients: [
        {
          weight: 3.14,
          name: 'pi',
          platform: 'fooPi',
          address: 'barPi'
        },
        {
          weight: 2.72,
          name: 'e',
          platform: 'fooE',
          address: 'barE'
        }
      ]
    })

    expect(Array.isArray(parsed)).to.equal(true)
    expect(parsed[0].weight + parsed[1].weight).to.equal(1)
  })
})
