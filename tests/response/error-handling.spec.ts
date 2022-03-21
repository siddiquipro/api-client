/*
 * @japa/api-client
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { ApiRequest } from '../../src/Request'
import { httpServer } from '../../test-helpers'

test.group('Response | error handling', (group) => {
  group.each.setup(async () => {
    await httpServer.create()
    return () => httpServer.close()
  })

  test('dump errors raised by the server', async ({ assert }) => {
    httpServer.onRequest((_, res) => {
      try {
        throw new Error('Something went wrong')
      } catch (error) {
        res.statusCode = 401
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ error: 'UnAuthorized' }))
      }
    })

    const request = new ApiRequest(
      { baseUrl: httpServer.baseUrl, method: 'GET', endpoint: '/' },
      {},
      { setup: [], teardown: [] }
    )

    const response = await request
    response.dump()
    assert.deepEqual(response.body(), { error: 'UnAuthorized' })
    assert.equal(response.status(), 401)
  })

  test('dump fatal errors raised by the server', async ({ assert }) => {
    httpServer.onRequest((_, res) => {
      try {
        throw new Error('Something went wrong')
      } catch (error) {
        res.statusCode = 500
        res.end(error.stack)
      }
    })

    const request = new ApiRequest(
      { baseUrl: httpServer.baseUrl, method: 'GET', endpoint: '/' },
      {},
      { setup: [], teardown: [] }
    )

    const response = await request
    response.dump()
    assert.equal(response.status(), 500)
  })
})
