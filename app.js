document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("pagina-pronta");

    const pulsanteMenu = document.querySelector(".toggler-menu");
    const menu = document.querySelector("#menu-principale");
    const sfondoMenu = document.querySelector("[data-sfondo-menu]");
    const pulsanteChiudi = document.querySelector(".chiudi-menu");

    if (pulsanteMenu && menu) {
        const chiudiMenu = () => {
            menu.classList.remove("menu-aperto");
            sfondoMenu?.classList.remove("visibile");
            document.body.classList.remove("menu-bloccato");
            pulsanteMenu.setAttribute("aria-expanded", "false");
        };

        const apriMenu = () => {
            menu.classList.add("menu-aperto");
            sfondoMenu?.classList.add("visibile");
            document.body.classList.add("menu-bloccato");
            pulsanteMenu.setAttribute("aria-expanded", "true");
        };

        pulsanteMenu.addEventListener("click", () => {
            menu.classList.contains("menu-aperto") ? chiudiMenu() : apriMenu();
        });

        pulsanteChiudi?.addEventListener("click", chiudiMenu);
        sfondoMenu?.addEventListener("click", chiudiMenu);

        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape") chiudiMenu();
        });

        menu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", chiudiMenu);
        });
    }

    const elementiDaMostrare = document.querySelectorAll(".reveal-on-scroll");
    if (elementiDaMostrare.length) {
        const osservatore = new IntersectionObserver((elementi) => {
            elementi.forEach((elemento) => {
                if (elemento.isIntersecting) {
                    elemento.target.classList.add("is-visible");
                    osservatore.unobserve(elemento.target);
                }
            });
        }, { threshold: 0.16 });
        elementiDaMostrare.forEach((elemento) => osservatore.observe(elemento));
    }

    const prefersRidottoMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersRidottoMovimento) {
        const elementiParallax = [...document.querySelectorAll("[data-parallax]")];
        if (elementiParallax.length) {
            let ticking = false;
            const aggiornaParallax = () => {
                const scrollY = window.scrollY;
                elementiParallax.forEach((elemento) => {
                    const fattore = parseFloat(elemento.dataset.parallax) || 0;
                    elemento.style.setProperty("--parallax-y", `${scrollY * fattore * -1}px`);
                });
                ticking = false;
            };
            aggiornaParallax();
            window.addEventListener("scroll", () => {
                if (!ticking) {
                    window.requestAnimationFrame(aggiornaParallax);
                    ticking = true;
                }
            }, { passive: true });
        }
    }

    const contatori = document.querySelectorAll("[data-count-target]");
    if (contatori.length) {
        const animaContatore = (elemento) => {
            const target = parseFloat(elemento.dataset.countTarget);
            const prefisso = elemento.dataset.countPrefix || "";
            const suffisso = elemento.dataset.countSuffix || "";
            const cifre = elemento.dataset.countPad ? parseInt(elemento.dataset.countPad, 10) : 0;
            const durata = 1300;
            const inizio = performance.now();

            const passo = (adesso) => {
                const progresso = Math.min((adesso - inizio) / durata, 1);
                const valore = Math.round(target * (1 - Math.pow(1 - progresso, 3)));
                const testoValore = cifre ? String(valore).padStart(cifre, "0") : String(valore);
                elemento.textContent = `${prefisso}${testoValore}${suffisso}`;
                if (progresso < 1) window.requestAnimationFrame(passo);
            };

            if (prefersRidottoMovimento) {
                const testoValore = cifre ? String(target).padStart(cifre, "0") : String(target);
                elemento.textContent = `${prefisso}${testoValore}${suffisso}`;
            } else {
                window.requestAnimationFrame(passo);
            }
        };

        const osservatoreContatori = new IntersectionObserver((elementi) => {
            elementi.forEach((elemento) => {
                if (elemento.isIntersecting) {
                    animaContatore(elemento.target);
                    osservatoreContatori.unobserve(elemento.target);
                }
            });
        }, { threshold: 0.5 });
        contatori.forEach((elemento) => osservatoreContatori.observe(elemento));
    }

    const carosellopacchetti = document.querySelector(".griglia-pacchetti");
    const pacchettoPremium = carosellopacchetti?.querySelector(".card-pacchetto-premium");
    if (carosellopacchetti && pacchettoPremium && window.matchMedia("(max-width: 900px)").matches) {
        carosellopacchetti.scrollLeft = pacchettoPremium.offsetLeft - (carosellopacchetti.clientWidth - pacchettoPremium.clientWidth) / 2;
    }

    const passiRacconto = [...document.querySelectorAll(".racconto-step")];
    const numeroAttivo = document.querySelector("[data-racconto-numero]");
    const labelAttiva = document.querySelector("[data-racconto-label]");
    if (passiRacconto.length && numeroAttivo && labelAttiva) {
        const osservatoreRacconto = new IntersectionObserver((elementi) => {
            elementi.forEach((elemento) => {
                if (elemento.isIntersecting) {
                    numeroAttivo.textContent = elemento.target.dataset.numero;
                    labelAttiva.textContent = elemento.target.dataset.label;
                    numeroAttivo.classList.add("attivo");
                    labelAttiva.classList.add("attivo");
                }
            });
        }, { threshold: 0, rootMargin: "-45% 0px -45% 0px" });
        passiRacconto.forEach((elemento) => osservatoreRacconto.observe(elemento));
    }

    document.querySelectorAll(".card-brand[data-dettaglio]").forEach((card) => {
        const dettaglio = document.createElement("span");
        dettaglio.className = "card-brand-dettaglio";
        dettaglio.textContent = card.dataset.dettaglio;
        card.querySelector(".card-brand-tag")?.after(dettaglio);
    });

    const filtri = document.querySelectorAll(".filtro-pill");
    const cardBrand = document.querySelectorAll(".card-brand[data-stato]");
    if (filtri.length && cardBrand.length) {
        filtri.forEach((pulsante) => {
            pulsante.addEventListener("click", () => {
                filtri.forEach((p) => p.classList.remove("attivo"));
                pulsante.classList.add("attivo");
                const filtro = pulsante.dataset.filtro;
                cardBrand.forEach((card) => {
                    const mostra = filtro === "tutte" || card.dataset.stato === filtro;
                    card.classList.toggle("filtro-nascosto", !mostra);
                });
            });
        });
    }

    const slide = document.querySelector(".carousel");
    if (!slide) return;

    const immagini = [...slide.querySelectorAll(".carousel-item")];
    let indice = immagini.findIndex((elemento) => elemento.classList.contains("active"));
    if (indice < 0) indice = 0;

    const mostraSlide = (nuovoIndice) => {
        indice = (nuovoIndice + immagini.length) % immagini.length;
        immagini.forEach((elemento, posizione) => {
            elemento.classList.toggle("active", posizione === indice);
        });
    };

    slide.querySelector(".carousel-control-prev")?.addEventListener("click", () => mostraSlide(indice - 1));
    slide.querySelector(".carousel-control-next")?.addEventListener("click", () => mostraSlide(indice + 1));
    window.setInterval(() => mostraSlide(indice + 1), 3200);
});
