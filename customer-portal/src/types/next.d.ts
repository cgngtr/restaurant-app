declare module 'next/link'
declare module 'next/image'
declare module 'next/navigation' {
  export function notFound(): never
  export function redirect(url: string): never
}

declare module 'next/server' {
  export interface NextRequest extends Request {
    nextUrl: URL
  }
  export class NextResponse extends Response {
    static json(body: any): NextResponse
    static redirect(url: string): NextResponse
  }
}

declare module 'next/headers' {
  export function cookies(): {
    get(name: string): { value: string } | undefined
    getAll(): Array<{ name: string; value: string }>
  }
  export function headers(): Headers
}

declare module 'next/image' {
  import { DetailedHTMLProps, ImgHTMLAttributes } from 'react'
  
  interface ImageProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    src: string
    alt: string
    width?: number
    height?: number
    fill?: boolean
    quality?: number
    priority?: boolean
    loading?: 'lazy' | 'eager'
    placeholder?: 'blur' | 'empty'
    blurDataURL?: string
  }

  export default function Image(props: ImageProps): JSX.Element
} 