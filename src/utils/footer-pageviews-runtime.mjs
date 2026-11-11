const SDK_URL =
	"https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
const COUNTER_URL =
	"https://busuanzi.ibruce.info/busuanzi?jsonpCallback=BusuanziCallback";

export function canTrackPageviews(
	enabled,
	production,
	hostname,
	canonicalHost,
	pathname = "/",
) {
	return (
		enabled &&
		production &&
		canonicalHost === "eitan.chronoresearch.org" &&
		hostname === canonicalHost &&
		!pathname.startsWith("/preview/")
	);
}

/** A new pathname/query counts once; initial Swup events and anchors do not. */
export function createPageviewGate() {
	let lastRoute;
	return (href) => {
		const url = new URL(href);
		const route = url.origin + url.pathname + url.search;
		if (route === lastRoute) return false;
		lastRoute = route;
		return true;
	};
}

export function pageviewText(count) {
	return typeof count === "number" && Number.isSafeInteger(count) && count >= 0
		? String(count)
		: "—";
}

export function startFooterPageviews() {
	const root = document.querySelector("footer-page-views");
	if (
		!root ||
		root.dataset.bound ||
		!canTrackPageviews(
			true,
			root.dataset.production === "true",
			location.hostname,
			root.dataset.hostname,
			location.pathname,
		)
	)
		return;
	root.dataset.bound = "true";
	const value = root.querySelector("#busuanzi_value_site_pv");
	if (!value) return;
	const claimRoute = createPageviewGate();
	let sdkReady = false;
	let sequence = Promise.resolve();
	let generation = 0;

	async function track() {
		const current = ++generation;
		value.textContent = "—";
		await new Promise((resolve) => {
			let observer;
			let sdk;
			let jsonp;
			let timer;
			let settled = false;
			const finish = (success) => {
				if (settled) return;
				settled = true;
				clearTimeout(timer);
				observer?.disconnect();
				if (!success && current === generation) value.textContent = "—";
				if (!success) {
					sdk?.remove();
					jsonp?.remove();
				}
				resolve();
			};
			const apply = (data) => {
				if (settled || current !== generation) return;
				value.textContent = pageviewText(data?.site_pv);
				finish(value.textContent !== "—");
			};
			timer = setTimeout(() => finish(false), 8000);
			if (!sdkReady) {
				// Official SDK performs exactly one initial request itself.
				observer = new MutationObserver(() => {
					const count = Number(value.textContent);
					if (
						/^\d+$/.test(value.textContent ?? "") &&
						Number.isSafeInteger(count)
					)
						finish(true);
				});
				observer.observe(value, {
					childList: true,
					subtree: true,
					characterData: true,
				});
				sdk = document.createElement("script");
				sdk.src = SDK_URL;
				sdk.async = true;
				sdk.onerror = () => finish(false);
				sdk.onload = () => {
					sdkReady = Boolean(window.bszCaller && window.bszTag);
					if (!sdkReady) {
						finish(false);
						return;
					}
					// Validate the official initial response, discarding a timed-out callback.
					window.bszTag.texts = apply;
					jsonp = [...document.scripts].find((script) =>
						script.src.startsWith("https://busuanzi.ibruce.info/busuanzi?"),
					);
					if (jsonp) jsonp.onerror = () => finish(false);
				};
				document.head.appendChild(sdk);
			} else {
				// Reuse the official transport without reloading or double-counting its SDK.
				window.bszCaller.fetch(COUNTER_URL, apply);
				jsonp = [...document.scripts].findLast((script) =>
					script.src.startsWith("https://busuanzi.ibruce.info/busuanzi?"),
				);
				if (jsonp) jsonp.onerror = () => finish(false);
			}
		});
	}
	const pageView = () => {
		if (!claimRoute(location.href)) return;
		sequence = sequence.then(track).catch(() => {
			value.textContent = "—";
		});
	};
	let bound = false;
	const bindSwup = () => {
		if (bound || !window.swup?.hooks) return;
		bound = true;
		window.swup.hooks.on("page:view", pageView);
	};
	pageView();
	bindSwup();
	if (!bound)
		document.addEventListener("swup:enable", bindSwup, { once: true });
}
