import { AwsClient } from 'aws4fetch';

export default{
    async fetch(request, env){
        const url = new URL(request.url);
        const key = decodeURIComponent(url.pathname.slice(1));
        
        const b2Url = new URL(
            `https://${env.B2_ENDPOINT}/${env.B2_BUCKET}/${key}`
        );

        const aws = new AwsClient({
            accessKeyId: env.B2_KEY_ID,
            secretAccessKey: env.B2_APP_KEY,
            service: 's3',
            region: env.B2_ENDPOINT.split('.')[1],
        });

        const headers = new Headers();
        const range = request.headers.get('Range');
        if(range){
            headers.set('Range', range);
        }

        const signed = await aws.sign(b2Url.toString(), {headers});
        const b2Res = await fetch(signed);

        const outHeaders = new Headers();
        outHeaders.set('Content-Type', b2Res.headers.get('Content-Type') || 'audio/mpeg');
        outHeaders.set('Accept-Ranges','bytes');
        outHeaders.set('Cache-Control', 'public, max-age = 31536000, immutable');
        outHeaders.set('Access-Control-Allow-Origin', '*');
        outHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

        const contentRange = b2Res.headers.get('Content-Range');
        if(contentRange){
            outHeaders.set('Content-Range', contentRange);
        }

        const contentLength = b2Res.headers.get('Content-Length');
        if(contentLength){
            outHeaders.set('Content-Length', contentLength);
        }

        const eTag = b2Res.headers.get('eTag');
        if(eTag){
            outHeaders.set('eTag', eTag);
        }

        if(url.searchParams.get('download')){
            const filename = key.split('/').pop();
            outHeaders.set(
                'Content-Disposition', `attachment; filename=${filename}"`
            );
        }

        if(request.method==='OPTIONS'){
            return new Response(null, {status:204, headers: outHeaders});
        }

        return new Response(b2Res.body, {
            status: b2Res.status,
            headers: outHeaders,
        });
    },
};