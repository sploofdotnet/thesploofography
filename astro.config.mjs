// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({

    fonts: [{
            provider: fontProviders.local(),
            name: "PopHappinessStd-EB",
            cssVariable: "--font-pop-happiness",
            options: {
                variants: [{
                    src: ['./src/assets/PopHappinessStd-EB.ttf'],
                    weight: 'normal',
                    style: 'normal'
                }]
            }
        }]
});
    
