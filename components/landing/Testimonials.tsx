import Image from "next/image";
import styles from "./Testimonials.module.css";
import { Play } from "lucide-react";

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>What Our Users Are Saying</h2>
          <p className={styles.subtitle}>
            I definitely had an effect on the business level - more efficiency, more reliability.
            Experienced by 2m+ happy users on your Personal/Pro/Business Teams!
          </p>
        </div>

        <div className={styles.grid}>
          {/* Testimonial 1 */}
          <div className={styles.card}>
            <div className={styles.userInfo}>
              <Image
                alt="Sarah"
                className={styles.avatar}
                height={48}
                width={48}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlZ9BE7vfdXJ2WoIAfj5tkLsOB1LImJYkQnSjw1rJS8yqnCrp0dA-BUobero0K8cZAOdYvNw_tShL8ZwN4LbHBig5d7Z9rn8SE_Ty3Zl5fnmMxV2_TKEAPgxIz_Fdy8x9PdFIICPZolJVQs8KeztjGcNMYyfBpASeOG7HSlwDBnd6uHPQ0CpDrHqi80Ku0QRiBC7PFPz2fGYWiEzrDi-q3u2D1Ojl0uY1QK2x9BSixatYVLPXiUiwE7yhstGQ0joIGE0etsVXs-P-D"
              />
              <div>
                <h4 className={styles.userName}>Sarah Jenkins</h4>
                <p className={styles.userRole}>Freelance Designer</p>
              </div>
            </div>
            <p className={styles.quote}>
              &quot;I used to dread the end of the month. Now I just text my expenses as I go. The
              AI insights actually made me realize I spent way too much on coffee! I am a big fan of
              the overall user experience and how smooth it works.&quot;
            </p>
          </div>

          {/* Video Placeholder */}
          <div className={styles.videoCard}>
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-dark to-brand opacity-80" />
            <div className={styles.playBtn}>
              <Play className="w-6 h-6 ml-1" />
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className={styles.card}>
            <div className={styles.userInfo}>
              <Image
                alt="Marcus"
                className={styles.avatar}
                height={48}
                width={48}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGCVWl6XaYKohOWOy10E4RwMI7PmeO5FxgtXxigoCzOCva3WQQb5CFx2ge99B9n4JUzLfZhP3NMTIrLrr9NynrAbC8cIgsbexzy49AzAbSVZzlUtzcxp8OOfHEZD606P0yUGBiFtAwWhiUfdOuNL7QH8iLbiacupA0xDerQxoMjFGfSFe4B29itlSNPDqcZDBFMHYSS5vePaHPissRfE3vC4KpwuqSJMHcfJ4iLIZ5CXeJv_CvxYWOFzgKx_CabPeOwEJrfHhhMc52"
              />
              <div>
                <h4 className={styles.userName}>Marcus Chen</h4>
                <p className={styles.userRole}>Software Engineer</p>
              </div>
            </div>
            <p className={styles.quote}>
              &quot;The natural language processing is scarily good. It knows what I mean when I
              type casually. I've tried multiple platforms, but Orbix stands out for its simplicity
              and the powerful dashboard features.&quot;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
