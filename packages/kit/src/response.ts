import type { Attributes, HTMLElementProxy } from "@wavekit/wave";

export class WaveKitResponse extends Response {
    static html(content: HTMLElementProxy<Attributes> | string) {
        return new WaveKitResponse(content.toString(), { headers: { "Content-Type": "text/html" } })
    }
}
