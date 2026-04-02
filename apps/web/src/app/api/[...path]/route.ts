import { NextResponse } from 'next/server'
import { API_BASE_URL } from ':/bases/env.server'

function buildTargetUrl(request: Request, path: string[]) {
  const incomingUrl = new URL(request.url)
  const targetUrl = new URL(`/api/${path.join('/')}`, API_BASE_URL)
  targetUrl.search = incomingUrl.search
  return targetUrl
}

async function proxy(request: Request, path: string[]) {
  const targetUrl = buildTargetUrl(request, path)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.delete('host')
  const requestBody =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text()

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: requestHeaders,
    body: requestBody,
    redirect: 'manual',
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  })
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params
  return proxy(request, path)
}
