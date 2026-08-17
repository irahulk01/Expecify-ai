import Link from "next/link";
import { Sparkles, Twitter, Github, Linkedin } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandColumn}>
            <div className={styles.logoContainer}>
              <div className={styles.logoIcon}>
                <Sparkles className="w-3 h-3" />
              </div>
              <span className={styles.logoText}>Expecify</span>
            </div>
            <p className={styles.description}>
              Find your ultimate financial companion designed to simplify money management and
              empower your financial well-being with Expecify.
            </p>
            <div className={styles.socialLinks}>
              <Link className={styles.socialIcon} href="#">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link className={styles.socialIcon} href="#">
                <Github className="w-5 h-5" />
              </Link>
              <Link className={styles.socialIcon} href="#">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className={styles.linksColumn}>
            <h3 className={styles.columnTitle}>Resources</h3>
            <ul className={styles.linkList}>
              <li>
                <Link className={styles.linkItem} href="#">
                  Home
                </Link>
              </li>
              <li>
                <Link className={styles.linkItem} href="#">
                  Services
                </Link>
              </li>
              <li>
                <Link className={styles.linkItem} href="#">
                  Company
                </Link>
              </li>
              <li>
                <Link className={styles.linkItem} href="#">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.linksColumn}>
            <h3 className={styles.columnTitle}>Company</h3>
            <ul className={styles.linkList}>
              <li>
                <Link className={styles.linkItem} href="#">
                  Blog
                </Link>
              </li>
              <li>
                <Link className={styles.linkItem} href="#">
                  Careers
                </Link>
              </li>
              <li>
                <Link className={styles.linkItem} href="#">
                  Contact
                </Link>
              </li>
              <li>
                <Link className={styles.linkItem} href="#">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.linksColumn}>
            <h3 className={styles.columnTitle}>Help</h3>
            <ul className={styles.linkList}>
              <li>
                <Link className={styles.linkItem} href="#">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link className={styles.linkItem} href="#">
                  Delivery Details
                </Link>
              </li>
              <li>
                <Link className={styles.linkItem} href="#">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link className={styles.linkItem} href="#">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Expecify Inc. All rights reserved.
          </p>
          <div className={styles.legalLinks}>
            <Link className={styles.legalLink} href="#">
              Terms
            </Link>
            <Link className={styles.legalLink} href="#">
              Privacy
            </Link>
            <Link className={styles.legalLink} href="#">
              Legal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
