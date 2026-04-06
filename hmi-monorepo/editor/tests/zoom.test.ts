import {strict as assert} from 'node:assert'
import {test} from 'node:test'
import {fitRectToViewport, zoomToPointTransform} from '../src/utils/zoom.js'

test('zoomToPointTransform keeps the pointer stationary on screen', () => {
    const current = {zoom: 1, offsetX: 0, offsetY: 0}
    const point = {x: 120, y: 80}
    const next = zoomToPointTransform(current, point, 2)
    assert.equal(next.zoom, 2)
    assert.equal(next.offsetX, -120)
    assert.equal(next.offsetY, -80)
})

test('zoomToPointTransform respects existing offsets', () => {
    const current = {zoom: 1.5, offsetX: 40, offsetY: -20}
    const point = {x: 200, y: 150}
    const next = zoomToPointTransform(current, point, 3)
    const scale = 3 / 1.5
    const expectedOffsetX = point.x - scale * (point.x - current.offsetX)
    const expectedOffsetY = point.y - scale * (point.y - current.offsetY)
    assert.equal(next.offsetX, expectedOffsetX)
    assert.equal(next.offsetY, expectedOffsetY)
})

test('fitRectToViewport centers content with padding', () => {
    const content = {left: 0, top: 0, width: 100, height: 50}
    const viewport = {width: 400, height: 200}
    const result = fitRectToViewport(content, viewport, 20)
    assert.equal(result.zoom, 3.2)
    assert.equal(result.offsetX, 40)
    assert.equal(result.offsetY, 20)
})

test('fitRectToViewport clamps zoom to defaults', () => {
    const content = {left: 0, top: 0, width: 1000, height: 1000}
    const viewport = {width: 200, height: 200}
    const result = fitRectToViewport(content, viewport, 20)
    assert(result.zoom >= 0.25)
})
