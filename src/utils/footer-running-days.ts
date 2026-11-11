/** One persistent timer; wake-up and Swup visits refresh a page kept open overnight. */
export function defineRunningDays(): void {
	if (customElements.get("site-running-days")) return;
	class SiteRunningDays extends HTMLElement {
		timer?: ReturnType<typeof setInterval>;
		update = (): void => {
			const launched = Date.parse(this.dataset.launchedAt ?? "");
			if (Number.isFinite(launched))
				this.textContent = String(
					Math.max(0, Math.floor((Date.now() - launched) / 86_400_000)),
				);
		};
		visible = (): void => {
			if (document.visibilityState === "visible") this.update();
		};
		connectedCallback(): void {
			if (this.timer !== undefined) return;
			this.update();
			this.timer = setInterval(this.update, 60_000);
			document.addEventListener("visibilitychange", this.visible);
			document.addEventListener("swup:page:view", this.update);
		}
		disconnectedCallback(): void {
			clearInterval(this.timer);
			this.timer = undefined;
			document.removeEventListener("visibilitychange", this.visible);
			document.removeEventListener("swup:page:view", this.update);
		}
	}
	customElements.define("site-running-days", SiteRunningDays);
}
