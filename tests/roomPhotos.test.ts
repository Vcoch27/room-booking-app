import { expect, it } from 'vitest';
import { roomPhotos } from '../src/domain/roomPhotos';

it('preserves gallery order, removes duplicates and ignores malformed entries', () => {
  expect(roomPhotos({ imageUrls: ['https://example.com/b.jpg', '', 'https://example.com/b.jpg', ' https://example.com/a.jpg ', 'file:///bad'] })).toEqual(['https://example.com/b.jpg', 'https://example.com/a.jpg']);
});

it('keeps old single-image room documents usable', () => {
  expect(roomPhotos({ imageUrl: 'https://example.com/cover.jpg' })).toEqual(['https://example.com/cover.jpg']);
  expect(roomPhotos({ imageUrls: [], imageUrl: 'https://example.com/cover.jpg' })).toHaveLength(1);
  expect(roomPhotos({})).toEqual([]);
});
