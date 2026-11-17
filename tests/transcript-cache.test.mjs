import assert from 'node:assert/strict';
import test from 'node:test';
import { YouTubeService } from '../dist/youtube-service.js';

test('caption lookup survives cache capacity and retains recent pagination evidence', async () => {
  const service = new YouTubeService();
  const fetches = new Map();
  service.fetchTranscriptSource = async (videoId) => {
    fetches.set(videoId, (fetches.get(videoId) ?? 0) + 1);
    return {
      segments: [{ text: videoId, offset: 0, duration: 1000 }],
      metadata: { videoId },
    };
  };
  for (let index = 0; index < 502; index += 1) {
    const videoId = `cache-fixture-${index}`;
    assert.equal((await service.getResearchTranscript(videoId)).fullTranscript[0].text, videoId);
  }
  const latest = await service.getResearchTranscript('cache-fixture-501');
  assert.equal(latest.source.videoId, 'cache-fixture-501');
  assert.equal(fetches.get('cache-fixture-501'), 1);
  await service.getResearchTranscript('cache-fixture-0');
  assert.equal(fetches.get('cache-fixture-0'), 2);
});
