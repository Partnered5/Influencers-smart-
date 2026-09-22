# UGC video studio

The Influencer Smart studio now includes a server-side UGC video workflow covering the seven objectives from the supplied concept list: reach, digital-product creation, daily sales, case studies, lead conversion, sponsorship pitches, and faceless systems.

## Provider configuration

The app intentionally keeps video generation behind a provider adapter so provider credentials never reach the browser. Configure these server environment variables:

```bash
UGC_VIDEO_PROVIDER_URL=https://your-provider.example/v1/videos
UGC_VIDEO_PROVIDER_KEY=replace-with-server-secret
```

The adapter sends a `POST` request with a bearer token and this JSON shape:

```json
{
  "prompt": "safe generated video prompt",
  "aspect_ratio": "portrait",
  "duration_seconds": 15,
  "generate_audio": true,
  "reference_image_url": "https://optional-reference.example/image.jpg"
}
```

The provider may return an inline base64 video or a URL. URL responses are saved as ready assets; inline base64 responses are uploaded to configured Manus storage. If the provider returns a job id without a URL, the job remains `queued` for a future status-polling adapter.

## Database

Run the repository migration after configuring the database:

```bash
pnpm db:push
```

This adds the `video_jobs` table and allows `content_items.kind = video`.

## Safety and disclosure

Video prompts are built server-side and explicitly constrain output to fictional adult creators or faceless product demos. The adapter also instructs the provider to avoid real-person imitation, minors, medical or financial guarantees, and undisclosed sponsorship implications. Every saved video and script carries `AI-generated virtual creator · Influencer Smart`.

## Extending the provider

If the chosen provider uses asynchronous polling or webhooks, extend `server/_core/videoGeneration.ts` to store the external job id and add a webhook or scheduled status handler. Keep the provider key server-side and preserve the existing `video_jobs` status lifecycle: `draft → queued → ready|failed`.
