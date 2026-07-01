import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 text-center px-4 text-xs md:text-sm text-muted-foreground font-medium leading-6 bg-transparent">
      <p>© {currentYear} Airlink - An ISP Billing System.</p>
      <p>
        Powered By{' '}
        <a
          href="https://www.netcarenepal.com"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline font-bold"
        >
          Netcare Nepal Pvt Ltd
        </a>
        .
      </p>
    </footer>
  );
};

export default Footer;
