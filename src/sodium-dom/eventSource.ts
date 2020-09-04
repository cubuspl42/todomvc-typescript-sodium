import { Stream, StreamSource } from "sodiumjs";

export function eventSource<K extends keyof HTMLElementEventMap>(
	htmlElement: HTMLElement,
	type: K,
): Stream<HTMLElementEventMap[K]>;

export function eventSource<K extends keyof WindowEventMap>(
	window: Window,
	type: K,
): Stream<WindowEventMap[K]>;

export function eventSource(
	target: EventTarget,
	type: string,
): Stream<Event> {
	return new StreamSource({
		addListener: (handle) => {
			const listener = (ev: Event) => handle(ev);
			target.addEventListener(type, listener);
			return () => target.removeEventListener(type, listener);
		}
	});
}

export function eventSource_<K extends keyof HTMLElementEventMap>(
	htmlElement: HTMLElement,
	type: K,
): Stream<HTMLElementEventMap[K]> {
	return new StreamSource({
		addListener: (handle) => {
			const listener = (ev: HTMLElementEventMap[K]) => handle(ev);
			htmlElement.addEventListener(type, listener);
			return () => htmlElement.removeEventListener(type, listener);
		}
	});
}
