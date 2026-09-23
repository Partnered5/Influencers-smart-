# UGC video studio

The Influencer Smart studio includes a server-side UGC workflow covering the seven objectives from the supplied concept list: reach, digital-product creation, daily sales, case studies, lead conversion, sponsorship pitches, and faceless systems.

## No-third-party mode (default)

No Runway, HeyGen, or other external video account is required. If no external provider variables are configured, the app uses this internal pipeline:

1. The existing internal Manus image-generation service creates a fictional adult creator still.
2. The server downloads that internal asset through a signed storage URL.
3. Local FFmpeg adds a slow camera move and a visible `AI-GENERATED VIRTUAL CREATOR` disclosure.
4. The resulting MP4 is uploaded to the app's own Manus storage and saved in the `video_jobs` table.

This produces a real downloadable MP4 without making a request to a third-party video provider. It is an animated UGC-style motion card rather than a fully synthesized talking-person clip. Voiceover is not synthesized in this fallback; it remains a script/caption field.

The runtime needs FFmpeg available as `ffmpeg` on the server. The current development environment has FFmpeg installed. If the chosen hosted runtime does not include FFmpeg, use a host with OS-level package support or install FFmpeg in the runtime image.

## Optional external provider override

External generation is optional. If both variables below are present, the adapter uses that provider instead of the internal local fallback:

```bash
UGC_VIDEO_PROVIDER_URL=https://your-provider.example/v1/videos
UGC_VIDEO_PROVIDER_KEY=replace-with-server-secret
```

Credentials stay server-side and must never be committed to Git or exposed in browser code.

## Provider request contract

The optional provider receives a `POST` request with a bearer token:

```json
{
  "prompt": "safe generated video prompt",
  "aspect_ratio": "portrait",
  "duration_seconds": 15,
  "generate_audio": true,
  "reference_image_url": "https://optional-reference.example/image.jpg"
}
```

The provider may return an inline base64 video or a URL:

```json
{ "url": "https://cdn.example.com/videos/ugc-123.mp4", "id": "provider-job-123" }
```

or:

```json
{
  "video": { "b64Json": "AAAAIGZ0eXBpc29tAA...", "mimeType": "video/mp4" },
  "id": "provider-job-456"
}
```

Asynchronous providers may return only an id. The app stores that id and leaves the job `queued`; provider-specific polling or webhook handling can be added later.

## Database and first test

Apply the migration:

```bash
pnpm db:push
```

Start the app:

```bash
pnpm dev
```

Then sign in, open **UGC video studio**, select one of the seven objectives, enter a brief and script, choose portrait or landscape, and click **Generate UGC video**. With no provider variables set, this exercises the internal image → local MP4 → Manus storage path.

## Safety and disclosure

Video prompts are built server-side and constrain output to fictional adult creators or faceless product demos. The system avoids real-person imitation, minors, medical or financial guarantees, and undisclosed sponsorship implications. Every saved video and script carries `AI-generated virtual creator · Influencer Smart`.

## Branded overlays and dynamic logos

The UGC director accepts `brandName`, `overlayHeadline`, `overlaySubhead`, `ctaText`, and an optional uploaded `brandLogo`. Logo files are stored privately, converted to a signed server-side URL, and composited in the top-left of local MP4 renders. Overlay copy is rendered as a lower-third headline, supporting line, CTA button, and the required AI disclosure.

Example CapitalSurvey launch payload:

```json
{
  "brandName": "CapitalSurvey",
  "overlayHeadline": "Make the next decision legible",
  "overlaySubhead": "Clearer investing decisions for the life you are building.",
  "ctaText": "Explore CapitalSurvey",
  "prompt": "A female creator introduces CapitalSurvey as a private financial-practice workspace for clearer investing decisions, life goals, and long-term planning.",
  "script": "If your next money decision feels noisy, start by making it legible. CapitalSurvey helps you connect investing decisions to the life you are building. Explore CapitalSurvey.",
  "aspectRatio": "portrait",
  "durationSeconds": 15,
  "voiceover": true
}
```

Use only claims supported by the brand. For financial brands, avoid promises of returns, guaranteed outcomes, or personalized financial advice unless the brand has supplied compliant copy and review. The public site currently describes CapitalSurvey as a private financial practice workspace for clearer investing decisions, life goals, and long-term planning.
