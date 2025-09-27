import React from 'react';
import { LIGHT_THEME } from '@/constants/theme';

const About = () => {
  return (
    <section
      id="about"
      className="py-24 scroll-mt-20"
      style={{ backgroundColor: LIGHT_THEME.background.secondary }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: LIGHT_THEME.text.primary }}
          >
            About TaskFlow
          </h2>
          <p
            className="text-xl max-w-3xl mx-auto"
            style={{ color: LIGHT_THEME.text.secondary }}
          >
            Empowering teams to achieve more through intelligent task management and seamless collaboration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3
              className="text-2xl font-semibold mb-6"
              style={{ color: LIGHT_THEME.text.primary }}
            >
              Our Mission
            </h3>
            <p
              className="text-lg mb-6"
              style={{ color: LIGHT_THEME.text.secondary }}
            >
              TaskFlow was built with a simple yet powerful vision: to transform how teams collaborate and manage their work.
              We believe that the right tools can unlock incredible productivity and creativity.
            </p>
            <p
              className="text-lg mb-8"
              style={{ color: LIGHT_THEME.text.secondary }}
            >
              Our platform combines intuitive design with powerful features to help teams stay organized,
              communicate effectively, and achieve their goals faster than ever before.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: LIGHT_THEME.background.primary }}>
                <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                <div style={{ color: LIGHT_THEME.text.secondary }}>Active Users</div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: LIGHT_THEME.background.primary }}>
                <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
                <div style={{ color: LIGHT_THEME.text.secondary }}>Tasks Completed</div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: LIGHT_THEME.background.primary }}>
                <div className="text-3xl font-bold text-blue-600 mb-2">1K+</div>
                <div style={{ color: LIGHT_THEME.text.secondary }}>Teams</div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: LIGHT_THEME.background.primary }}>
                <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                <div style={{ color: LIGHT_THEME.text.secondary }}>Uptime</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div
              className="rounded-xl shadow-xl p-8"
              style={{ backgroundColor: LIGHT_THEME.background.primary }}
            >
              <h4
                className="text-xl font-semibold mb-4"
                style={{ color: LIGHT_THEME.text.primary }}
              >
                Why Choose TaskFlow?
              </h4>
              <ul className="space-y-4">
                {[
                  'Intuitive and user-friendly interface',
                  'Real-time collaboration features',
                  'Advanced project management tools',
                  'Seamless integrations with popular apps',
                  'Enterprise-grade security',
                  '24/7 customer support'
                ].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span style={{ color: LIGHT_THEME.text.secondary }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
