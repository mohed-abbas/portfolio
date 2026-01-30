'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import Image from 'next/image';
import styles from './Projects.module.css';
import { content } from '@/data';

export const Projects = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { projects } = content;

  useEffect(() => {
    const ctx = gsap.context(() => {
        const sections = document.querySelectorAll<HTMLElement>(`.${styles.projectSection}`);

        sections.forEach((section) => {
            const topPart = section.querySelector(`.${styles.textTop}`);
            const botPart = section.querySelector(`.${styles.textBottom}`);
            const imgCard = section.querySelector(`.${styles.imageCard}`);
            const imgWrapper = section.querySelector(`.${styles.projectImgWrapper}`);
            const badge = section.querySelector(`.${styles.funkyBadge}`);
            const meta = section.querySelector(`.${styles.projectMeta}`);
            const stickyContainer = section.querySelector(`.${styles.projectSticky}`);

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 2.5,
                    pin: stickyContainer,
                    // No background color changes - InteractiveBackground shows through entirely
                }
            });

            // 1. THE SNAP (Rotate and Separate)
            // PERF: Added force3D for consistent GPU compositing
            tl.to(topPart, {
                yPercent: -45,
                rotation: -5, // Rotate Left
                force3D: true,
                ease: "power2.inOut",
            }, "start")
            .to(botPart, {
                yPercent: 45,
                rotation: 5, // Rotate Right
                force3D: true,
                ease: "power2.inOut",
            }, "start");

            // 2. IMAGE POP (Scale and Straighten)
            tl.to(imgCard, {
                scale: 1,
                rotation: 0, // Straighten out
                opacity: 1,
                force3D: true,
                ease: "back.out(1.2)" // Bouncy effect
            }, "start+=0.05");

            // 3. INNER PARALLAX
            tl.to(imgWrapper, {
                scale: 1.1,
                force3D: true,
                ease: "none"
            }, "start");

            // 4. BADGE SPIN IN
            tl.to(badge, {
                scale: 1,
                rotation: 360,
                force3D: true,
                ease: "elastic.out(1, 0.5)"
            }, "start+=0.3");

            // 5. META FADE
            tl.to(meta, {
                opacity: 1,
                y: 0,
                force3D: true,
                duration: 0.2
            }, "start+=0.4");
        });
    }, containerRef);

    return () => ctx.revert();
  }, [projects]);

  return (
    <div ref={containerRef} className={styles.section}>
       
       {projects.items.map((project) => (
           <div 
             key={project.id} 
             className={styles.projectSection} 
             data-color={project.themeColor}
           >
               <div className={styles.projectSticky}>
                   
                   {/* Image */}
                   <div className={styles.imageCard}>
                        <div className={styles.projectImgWrapper}>
                             <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                // unoptimized
                                style={{ objectFit: 'cover', objectPosition: 'top', objectViewBox: '0 0 800 600' }}
                                sizes="(max-width: 768px) 100vw, 80vw"
                                priority={false}
                             />
                        </div>
                   </div>

                   {/* Funky Badge */}
                   <div 
                    className={styles.funkyBadge}
                    style={{
                        backgroundColor: project.badgeColor, 
                        color: project.badgeTextColor,
                        boxShadow: `5px 5px 0px ${project.badgeShadowColor || 'black'}`
                    }}
                   >
                       <span dangerouslySetInnerHTML={{__html: project.badge}} /> 
                   </div>

                   {/* Text Splitter */}
                   <div className={styles.titleWrapper}>
                        <div className={styles.textTop}>
                            <div className={styles.textBacking}></div>
                            <div className={styles.textContent}>{project.title}</div>
                        </div>
                        <div className={styles.textBottom}>
                            <div className={styles.textBacking}></div>
                            <div className={styles.textContent}>{project.title}</div>
                        </div>
                   </div>

                   {/* Meta */}
                   <div className={styles.projectMeta}>
                       <div className={styles.pill}>{project.year}</div>
                       <div className={styles.pill}>{project.category}</div>
                   </div>

               </div>
           </div>
       ))}

       <div className={styles.spacer}>Fin.</div>
    </div>
  );
};
