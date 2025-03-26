import { useEffect } from "react";
import "./home.css";
import arrow from "../assets/arrow.svg";
import Offen from "../assets/OffenLogo.svg";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import tool from "../assets/background.png"
import hook from "../assets/hook.svg"

import { LuVoicemail, LuBookOpen, LuMessageSquareDot } from "react-icons/lu";

gsap.registerPlugin(ScrollTrigger);


export const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        gsap.to(".navbar", {
            marginTop: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".home-slogan",
                start: "top 14%",
                end: "bottom top",
                toggleActions: "play none play reverse",
            },
        });
    }, []);

    return (
        <div className="home-container">
            <div className="navbar">
                <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}                >
                    <img src={Offen} alt="Offen" className="navbar-logo" />
                </div>
                <div className="begin-button" onClick={() => navigate("/lobby")}>Commencer</div>
            </div>

            <div className="home-presentation">
                <img src={Offen} alt="Offen" className="Offen-logo" />
                <div className="big-text-home">
                    l'Inclusion des Personnes en<br />
                    Situation de Handicap
                </div>
                <div className="little-text-home">
                    Dans un monde en constante évolution, la société rejète sans<br />
                    cesse ceux qui ont des difficultés au quotidien<br />
                </div>
                <div className="get-started" onClick={() => navigate("/lobby")}>
                    Commencer
                    <img src={arrow} alt="begin" />
                </div>
            </div>

            <div className="Section-title">
                <div className="div-identification"></div>Utiliser Offen c'est avoir
            </div>

            <div className="home-slogan">
                <div className="slogan-block">
                    <p className="slogan-title">#Un Avenir Meilleur</p>
                    <p className="slogan-text">Offen ouvre l'accès à l'éducation pour les sourds et les aveugles, leur offrant ainsi de meilleures opportunités pour l'avenir</p>
                </div>
                <div className="slogan-block">
                    <p className="slogan-title">#Une Forte Autonomie </p>
                    <p className="slogan-text">Une autonomie basé sur la capacité de suivre les cours en temps réel, avec des outils adaptés comme la transcription et la lecture audio</p>
                </div>
                <div className="slogan-block">
                    <p className="slogan-title">#Une Confiance Solide</p>
                    <p className="slogan-text">Capabilité de suivre les cours de manière autonome et égalitaire, renforçant ainsi leur engagement et leur réussite scolaire</p>
                </div>
            </div>

            <h2 className="little-text-after-section">
                Ton application offre aux sourds et aveugles une autonomie totale pour suivre les cours, renforçant leur confiance et leur permettant d'accéder à une éducation inclusive et égale. Rejoignez-nous pour transformer l'apprentissage
            </h2>

            <div className="tool-display">
                <img src={tool} alt="Tool-image" className="Tool-image" />
                <div className="blabla-tool">
                    <div className="Section-title tool-title">
                        <div className="div-identification"></div>
                        Fonctionnalités
                    </div>
                    <div className="tool-list">
                        <div className="tool-box">
                            <div className="tool-icon">
                                <LuVoicemail size='28px' />
                            </div>
                            <div className="tool-info">
                                <div className="tool-name">Transcription Immédiat</div>
                                <div className="tool-text">La fonctionnalité de transcription en temps réel permet de convertir les paroles ou les sons captés par un microphone en texte instantanément</div>
                            </div>
                        </div>
                        <div className="tool-box">
                            <div className="tool-icon">
                                <LuBookOpen size='28px' />
                            </div>
                            <div className="tool-info">
                                <div className="tool-name">Assistant de lécture</div>
                                <div className="tool-text">Une lecture à voix haute l=des cours enregistrés pendant les révisions, facilitant l'accès à l'information pour les malvoyants</div>
                            </div>
                        </div>
                        <div className="tool-box">
                            <div className="tool-icon">
                                <LuMessageSquareDot size='28px' />
                            </div>
                            <div className="tool-info">
                                <div className="tool-name">Questions Intéractifs</div>
                                <div className="tool-text">réponses visuelles, tactiles ou écrites pour permettre aux personnes sourdes ou muettes de participer activement</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="Section-title">
                <div className="div-identification"></div>Perspectives et évolutions
            </div>

            <div className="perspectives">
                <div className="perspectives-block">
                    <p>Notre application représente une première avancée vers une éducation plus accessible. L’objectif est d’enrichir progressivement ses fonctionnalités afin d’améliorer l’expérience des étudiants en situation de handicap et de garantir une inclusion plus large.</p>
                </div>
                <div className="perspectives-block">
                    <p>L’intégration d’une intelligence artificielle permettra d’optimiser la transcription en temps réel, rendant la conversion de la parole en texte plus précise et adaptée aux besoins de chaque utilisateur. La prise en charge de la langue des signes à travers un avatar interactif offrira aux étudiants sourds une meilleure compréhension des cours.</p>
                </div>
                <div className="perspectives-block">
                    <p>Des options de personnalisation seront développées pour répondre aux besoins spécifiques des personnes malvoyantes, avec des modes d’affichage adaptés et une lecture vocale améliorée. L’application intégrera également des outils interactifs pour encourager l’échange entre étudiants et enseignants, favorisant ainsi une participation plus active en classe.</p>
                </div>
                <div className="perspectives-block">
                    <p>Enfin, l’extension de l’application à d’autres langues et contextes éducatifs permettra d’élargir son impact et de garantir un accès équitable au savoir pour tous. L’ambition à long terme est de faire de la technologie un levier d’égalité, en brisant les barrières qui freinent l’apprentissage et l’inclusion.</p>
                </div>
            </div>

            <div className="footer">
                <div className="gradient"></div>
                <img src={hook} alt="Our Team" className="team-logo" />
                <div className="collaborators">
                    <div className="mate">Aaron</div>
                    <div className="mate">Eliada</div>
                    <div className="mate">Fenohasina</div>
                    <div className="mate">Sara</div>
                    <div className="mate">Sitraka</div>
                </div>
                <div className="thanks">Thank You All!</div>
            </div>
        </div>
    );
};
