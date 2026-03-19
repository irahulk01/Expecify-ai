import Image from "next/image";

export default function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-background-dark to-surface-dark opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-2xl font-bold text-white mb-10 text-center">
          People ❤️ Expensify AI
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div className="bg-surface-dark border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <Image
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
                height={40}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlZ9BE7vfdXJ2WoIAfj5tkLsOB1LImJYkQnSjw1rJS8yqnCrp0dA-BUobero0K8cZAOdYvNw_tShL8ZwN4LbHBig5d7Z9rn8SE_Ty3Zl5fnmMxV2_TKEAPgxIz_Fdy8x9PdFIICPZolJVQs8KeztjGcNMYyfBpASeOG7HSlwDBnd6uHPQ0CpDrHqi80Ku0QRiBC7PFPz2fGYWiEzrDi-q3u2D1Ojl0uY1QK2x9BSixatYVLPXiUiwE7yhstGQ0joIGE0etsVXs-P-D"
                width={40}
              />
              <div>
                <h4 className="text-white font-bold text-sm">Sarah Jenkins</h4>
                <p className="text-slate-500 text-xs">Freelance Designer</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm italic">
              &quot;I used to dread the end of the month. Now I just text my
              expenses as I go. The AI insights actually made me realize I spent
              way too much on coffee!&quot;
            </p>
          </div>
          {/* Testimonial 2 */}
          <div className="bg-surface-dark border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <Image
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
                height={40}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGCVWl6XaYKohOWOy10E4RwMI7PmeO5FxgtXxigoCzOCva3WQQb5CFx2ge99B9n4JUzLfZhP3NMTIrLrr9NynrAbC8cIgsbexzy49AzAbSVZzlUtzcxp8OOfHEZD606P0yUGBiFtAwWhiUfdOuNL7QH8iLbiacupA0xDerQxoMjFGfSFe4B29itlSNPDqcZDBFMHYSS5vePaHPissRfE3vC4KpwuqSJMHcfJ4iLIZ5CXeJv_CvxYWOFzgKx_CabPeOwEJrfHhhMc52"
                width={40}
              />
              <div>
                <h4 className="text-white font-bold text-sm">Marcus Chen</h4>
                <p className="text-slate-500 text-xs">Software Engineer</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm italic">
              &quot;The natural language processing is scarily good. It knows
              &apos;Maccas&apos; is food and &apos;Uber&apos; is transport without
              me doing anything. Best tracker I&apos;ve used.&quot;
            </p>
          </div>
          {/* Testimonial 3 */}
          <div className="bg-surface-dark border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <Image
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
                height={40}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHFWKOsiy8Qh5S97cumoVUzockquDDa_TWl46J6S1WP07EeWuGmYJ1ct60nZCXsZzVhfSvdVmrg3wApP3DiGWtY-M_ia8SEfqUIBZPX1ospdXf3-sAXB6aT7nXDOXyyg96u7660aYpURn8gmgUPpNzJXEfJfaivQoCJqJ40pX4IYX8wQLVgbZATzt3_mvWOf5nSFb09RJkOmoyk0Xaiv6-15DdvkWWgJPfA9u4JIk0xmToB9X4TzVmrg9t4YMVwgdr1gPTY2OZ7JnG"
                width={40}
              />
              <div>
                <h4 className="text-white font-bold text-sm">Elara Vance</h4>
                <p className="text-slate-500 text-xs">Student</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm italic">
              &quot;Finally an app that doesn&apos;t feel like a spreadsheet.
              It&apos;s actually fun to use, and the dark mode design is gorgeous.&quot;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
