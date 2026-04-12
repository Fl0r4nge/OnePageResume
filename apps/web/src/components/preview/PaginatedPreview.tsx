import { Suspense, useEffect, useMemo, useRef, useState } from 'react'

const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123

interface PaginatedPreviewProps {
  TemplateComponent: React.ComponentType<{ data: any }>
  data: any
  onPageCountChange?: (count: number) => void
}

const MIN_CHUNK_PX = 120
const PAGE_BOTTOM_GUARD_PX = 24
const PAGE_TOP_PADDING_PX = 24

function getLineStartBreakpoints(root: HTMLElement, totalHeight: number): number[] {
  const rootRect = root.getBoundingClientRect()
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const points = new Set<number>()

  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text
    if (!textNode.nodeValue || !textNode.nodeValue.trim()) continue

    const range = document.createRange()
    range.selectNodeContents(textNode)
    const rects = Array.from(range.getClientRects())

    rects.forEach((rect) => {
      if (rect.height < 8) return
      const top = Math.floor(rect.top - rootRect.top)
      if (top > 0 && top < totalHeight) points.add(top)
    })

    range.detach()
  }

  return Array.from(points).sort((a, b) => a - b)
}

function getBlockStartBreakpoints(root: HTMLElement, totalHeight: number): number[] {
  const rootRect = root.getBoundingClientRect()
  const nodes = root.querySelectorAll<HTMLElement>('section, h1, h2, h3, h4, h5, h6, p, ul, ol, li')
  const points = new Set<number>()

  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect()
    if (rect.height < 8) return
    const top = Math.floor(rect.top - rootRect.top)
    if (top > 0 && top < totalHeight) points.add(top)
  })

  return Array.from(points).sort((a, b) => a - b)
}

function pickBestBreakpoint(
  cursor: number,
  minStart: number,
  maxStart: number,
  candidates: number[]
): number | null {
  let best: number | null = null
  for (const point of candidates) {
    if (point < minStart) continue
    if (point > maxStart) break
    best = point
  }
  return best
}

function pickNextBreakpointAfter(after: number, candidates: number[]): number | null {
  for (const point of candidates) {
    if (point > after) return point
  }
  return null
}

function computePageStarts(root: HTMLElement, totalHeight: number): number[] {
  const lineBreakpoints = getLineStartBreakpoints(root, totalHeight)
  const blockBreakpoints = getBlockStartBreakpoints(root, totalHeight)
  const starts: number[] = [0]
  let cursor = 0
  let guard = 0

  while (cursor + A4_HEIGHT_PX < totalHeight && guard < 2000) {
    const minStart = cursor + MIN_CHUNK_PX
    const maxStart = cursor + A4_HEIGHT_PX - PAGE_BOTTOM_GUARD_PX

    const lineCandidate = pickBestBreakpoint(cursor, minStart, maxStart, lineBreakpoints)
    const blockCandidate = pickBestBreakpoint(cursor, minStart, maxStart, blockBreakpoints)
    const nextAfterLine = pickNextBreakpointAfter(maxStart, lineBreakpoints)
    const nextAfterBlock = pickNextBreakpointAfter(maxStart, blockBreakpoints)
    const next = blockCandidate ?? lineCandidate ?? nextAfterBlock ?? nextAfterLine ?? maxStart

    if (next <= cursor) break
    cursor = next
    starts.push(cursor)
    guard += 1
  }

  return starts
}

export default function PaginatedPreview({ TemplateComponent, data, onPageCountChange }: PaginatedPreviewProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [pageStarts, setPageStarts] = useState<number[]>([0])
  const [totalHeight, setTotalHeight] = useState<number>(A4_HEIGHT_PX)

  useEffect(() => {
    const el = measureRef.current
    if (!el) return

    const updatePagination = () => {
      const root = el.querySelector('.resume-page') as HTMLElement | null
      if (!root) return
      const h = Math.max(A4_HEIGHT_PX, Math.ceil(root.scrollHeight || A4_HEIGHT_PX))
      setTotalHeight(h)
      setPageStarts(computePageStarts(root, h))
    }

    updatePagination()

    const observer = new ResizeObserver(() => updatePagination())
    observer.observe(el)

    return () => observer.disconnect()
  }, [data, TemplateComponent])

  const pageCount = useMemo(() => Math.max(1, pageStarts.length), [pageStarts])

  useEffect(() => {
    onPageCountChange?.(pageCount)
  }, [pageCount, onPageCountChange])

  return (
    <div className="resume-pagination">
      <div ref={measureRef} className="resume-pagination-measure" style={{ width: `${A4_WIDTH_PX}px` }}>
        <Suspense fallback={null}>
          <TemplateComponent data={data} />
        </Suspense>
      </div>

      {pageStarts.map((startOffset, pageIndex) => {
        const topPad = pageIndex > 0 ? PAGE_TOP_PADDING_PX : 0
        const nextStart = pageStarts[pageIndex + 1] ?? totalHeight
        const logicalPageHeight = nextStart - startOffset
        const maskHeight = A4_HEIGHT_PX - logicalPageHeight - topPad

        return (
          <div key={pageIndex} className="resume-sheet" style={{ width: `${A4_WIDTH_PX}px`, height: `${A4_HEIGHT_PX}px` }}>
            <div
              className="resume-sheet-content"
              style={{ width: `${A4_WIDTH_PX}px`, top: topPad, transform: `translateY(-${startOffset}px)` }}
            >
              <Suspense fallback={<div className="resume-page flex items-center justify-center text-gray-400">模板加载中...</div>}>
                <TemplateComponent data={data} />
              </Suspense>
            </div>
            {topPad > 0 && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: `${A4_WIDTH_PX}px`,
                  height: topPad,
                  backgroundColor: 'white',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
            )}
            {maskHeight > 0 && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: logicalPageHeight + topPad,
                  width: `${A4_WIDTH_PX}px`,
                  height: maskHeight,
                  backgroundColor: 'white',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
