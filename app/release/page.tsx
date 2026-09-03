"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { HUSNAINS_VARIANTS, getHusnainsVariant } from "@/lib/husnainsVariants";

type ExperienceStep =
  | "PRODUCT"
  | "SEARCH"
  | "ADDRESS"
  | "PAYMENT"
  | "SUBMITTED"
  | "SUCCESS";

type ReservationData = {
  id: string;
  releaseId?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  price: number;
  variantKey?: string;
  variantName?: string;
  variantSku?: string;
  status: string;
  orderStatus?: string;
  paymentStatus?: string;
  expiresAt: string;
  slotNumber?: number;
  slotName?: string;
  releaseName?: string;
  totalSlots?: number;
  securedSlots?: number;
};

const PRODUCT_IMAGES = [
  "/images/husnains-product-01.jpg",
  "/images/husnains-product-02.jpg",
  "/images/husnains-edition.png",
  "/images/husnains-product-01.jpg",
];

const PACKAGING_IMAGES = [
  "/images/husnains-packaging.jpg",
  "/images/husnains-packaging-01.jpg",
  "/images/husnains-packaging-02.jpg",
  "/images/husnains-packaging.jpg",
];

const SEARCH_STAGES = [
  {
    label: "CONNECTING TO RELEASE",
    description: "Opening the live Husnains Edition reservation channel.",
    query: "release.silentyahya.com / live channel",
  },
  {
    label: "CHECKING AVAILABILITY",
    description: "Checking whether a reservation position can currently be requested.",
    query: "availability pool / reservation window",
  },
  {
    label: "SEARCHING ALLOCATIONS",
    description: "Scanning the private allocation pool for a possible position.",
    query: "private allocation pool / active positions",
  },
  {
    label: "MATCHING REQUEST",
    description: "Comparing your request against the current release conditions.",
    query: "request signature / release conditions",
  },
  {
    label: "VERIFYING POSITION",
    description: "Running the final availability and reservation checks.",
    query: "position check / reservation rules",
  },
  {
    label: "PRELIMINARY MATCH FOUND",
    description: "A possible position has been found. Your details are required to attempt the reservation.",
    query: "possible allocation / final handoff",
  },
];

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
];

function buildUpiLink(amount: number, variantName: string, reservationId?: string) {
  const params = new URLSearchParams({
    pa: "9121783895@fam",
    pn: "Silent Yahya",
    am: amount.toFixed(2),
    cu: "INR",
    tn: reservationId
      ? `HUSNAINS ${variantName} ${reservationId}`
      : `HUSNAINS ${variantName}`,
  });

  return `upi://pay?${params.toString()}`;
}

function safeImageFallback(event: React.SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;

  if (!image.dataset.fallbackApplied) {
    image.dataset.fallbackApplied = "true";
    image.src = "/images/husnains-edition.jpg";
  }
}

function formatCountdown(milliseconds: number) {
  if (milliseconds <= 0) return "00:00";

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function GoldRule({ label }: { label?: string }) {
  return (
    <div className="gold-rule">
      <span />
      {label && <small>{label}</small>}
      <span />
    </div>
  );
}

function SectionEyebrow({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-eyebrow">
      <span className="section-number">{number}</span>
      <span>{children}</span>
    </div>
  );
}

function Logo() {
  return (
    <img
      src="/images/silent-yahya-logo.png"
      alt="Silent Yahya"
      className="brand-logo"
      onError={safeImageFallback}
    />
  );
}

function ImageFrame({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`image-frame ${className}`}>
      <div className="image-frame-corner corner-tl" />
      <div className="image-frame-corner corner-tr" />
      <div className="image-frame-corner corner-bl" />
      <div className="image-frame-corner corner-br" />

      <img src={src} alt={alt} onError={safeImageFallback} />

      <div className="image-shine" />
    </div>
  );
}

function TopBar({ onBook }: { onBook: () => void }) {
  return (
    <>
      <div className="announcement">
        <span>✦</span>
        HUSNAINS EDITION · SILENT YAHYA
        <span>✦</span>
      </div>

      <header className="nav">
        <div className="nav-inner">
          <a href="#top" className="brand">
            <Logo />
          </a>

          <nav className="desktop-nav">
            <a href="#edition">EDITION</a>
            <a href="#fragrance">FRAGRANCE</a>
            <a href="#presentation">PRESENTATION</a>
            <a href="#story">STORY</a>
            <a href="#journey">JOURNEY</a>
          </nav>

          <button className="nav-book" onClick={onBook}>
            BOOK MY SLOT <span>↗</span>
          </button>
        </div>
      </header>
    </>
  );
}

function ProductGallery({
  variant,
}: {
  variant: (typeof HUSNAINS_VARIANTS)[number];
}) {
  const [index, setIndex] = useState(0);
  const touchStart = React.useRef<number | null>(null);
  const images = variant.images?.length ? variant.images : [variant.image];

  useEffect(() => {
    setIndex(0);
  }, [variant.key]);

  const previous = () => setIndex((value) => (value - 1 + images.length) % images.length);
  const next = () => setIndex((value) => (value + 1) % images.length);

  return (
    <div
      className="sy-gallery"
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const endX = event.changedTouches[0]?.clientX ?? touchStart.current;
        const delta = endX - touchStart.current;
        if (Math.abs(delta) > 45) delta > 0 ? previous() : next();
        touchStart.current = null;
      }}
    >
      <div className="sy-gallery-stage">
        <div className="sy-gallery-glow" />
        <div className="sy-gallery-arch" />
        <div className="sy-gallery-floor" />
        <img
          key={`${variant.key}-${index}`}
          src={images[index]}
          alt={`${variant.name} product image ${index + 1}`}
          onError={safeImageFallback}
          className="sy-gallery-main-image"
        />

        <button className="sy-gallery-arrow sy-gallery-arrow-left" onClick={previous} aria-label="Previous image">
          ‹
        </button>
        <button className="sy-gallery-arrow sy-gallery-arrow-right" onClick={next} aria-label="Next image">
          ›
        </button>
      </div>

      <div className="sy-gallery-controls">
        <button onClick={previous} aria-label="Previous product image">←</button>
        <div className="sy-gallery-dots">
          {images.map((_, imageIndex) => (
            <button
              key={imageIndex}
              className={imageIndex === index ? "active" : ""}
              onClick={() => setIndex(imageIndex)}
              aria-label={`View image ${imageIndex + 1}`}
            />
          ))}
        </div>
        <button onClick={next} aria-label="Next product image">→</button>
      </div>

      <div className="sy-gallery-thumbs">
        {images.map((image, imageIndex) => (
          <button
            key={image}
            className={imageIndex === index ? "active" : ""}
            onClick={() => setIndex(imageIndex)}
            aria-label={`View product image ${imageIndex + 1}`}
          >
            <img src={image} alt="" onError={safeImageFallback} />
          </button>
        ))}
      </div>

      <div className="sy-gallery-meta">
        <span>{variant.name}</span>
        <small>SWIPE TO EXPLORE · {index + 1} / {images.length}</small>
      </div>
    </div>
  );
}

function Hero({
  onBook,
  selectedVariant,
  onVariantChange,
}: {
  onBook: () => void;
  selectedVariant: (typeof HUSNAINS_VARIANTS)[number];
  onVariantChange: (key: string) => void;
}) {
  return (
    <section className="sy-hero" id="top">
      <div className="sy-hero-bg" />
      <div className="sy-hero-glow sy-hero-glow-a" />
      <div className="sy-hero-glow sy-hero-glow-b" />

      <header className="sy-hero-nav">
        <a href="#top" className="sy-hero-brand" aria-label="Silent Yahya">
          <img src="/images/silent-yahya-logo.png" alt="Silent Yahya" onError={safeImageFallback} />
        </a>
        <div className="sy-hero-nav-meta">
          <span>HUSNAINS EDITION</span><i /><span>12 ML</span>
        </div>
        <button className="sy-nav-cta" onClick={onBook}>BOOK MY SLOT <b>↗</b></button>
      </header>

      <div className="sy-hero-frame"><div className="sy-frame-arch" /></div>

      <div className="sy-hero-content">
        <div className="sy-hero-copy">
          <div className="sy-kicker"><span>01</span><div><strong>SILENT YAHYA</strong><em>PRIVATE RELEASE</em></div></div>
          <h1>HUSNAINS<span>EDITION</span></h1>
          <p>A private fragrance experience from Silent Yahya.<br />Designed to be discovered slowly.</p>

          <div className="sy-hero-desktop-picker sy-variant-picker">
            <div className="sy-variant-picker-head"><span>SELECT YOUR FINISH</span><strong>{selectedVariant.shortName}</strong></div>
            <div className="sy-variant-options" role="radiogroup" aria-label="Husnains Edition finish">
              {HUSNAINS_VARIANTS.map((variant) => (
                <button key={variant.key} type="button" className={`sy-variant-card ${selectedVariant.key === variant.key ? "selected" : ""}`} onClick={() => onVariantChange(variant.key)} role="radio" aria-checked={selectedVariant.key === variant.key}>
                  <span className="sy-variant-swatch" style={{ background: variant.swatch }} />
                  <span className="sy-variant-card-copy"><strong>{variant.shortName}</strong><small>₹{variant.price}</small></span>
                  {selectedVariant.key === variant.key && <b>✓</b>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sy-mobile-variant-picker">
          <div className="sy-variant-picker-head"><span>SELECT YOUR FINISH</span><strong>{selectedVariant.shortName}</strong></div>
          <div className="sy-variant-options" role="radiogroup" aria-label="Husnains Edition finish">
            {HUSNAINS_VARIANTS.map((variant) => (
              <button key={variant.key} type="button" className={`sy-variant-card ${selectedVariant.key === variant.key ? "selected" : ""}`} onClick={() => onVariantChange(variant.key)} role="radio" aria-checked={selectedVariant.key === variant.key}>
                <span className="sy-variant-swatch" style={{ background: variant.swatch }} />
                <span className="sy-variant-card-copy"><strong>{variant.shortName}</strong><small>₹{variant.price}</small></span>
                {selectedVariant.key === variant.key && <b>✓</b>}
              </button>
            ))}
          </div>
        </div>

        <div className="sy-hero-product">
          <ProductGallery variant={selectedVariant} />
        </div>

        <div className="sy-mobile-buy">
          <div className="sy-mobile-price"><span>12 ML</span><i /><strong>₹{selectedVariant.price}</strong></div>
          <button className="sy-main-cta" onClick={onBook}><span>BOOK MY SLOT</span><b>↗</b></button>
          <div className="sy-release-note"><span>✦</span> Reservation-based private release</div>
        </div>
      </div>

      <div className="sy-hero-scroll"><span>DISCOVER THE EDITION</span><i /><b>↓</b></div>
    </section>
  );
}

function EditionSection() {
  return (
    <section className="section edition-section" id="edition">
      <div className="section-shell">
        <div className="edition-heading">
          <SectionEyebrow number="02">THE EDITION</SectionEyebrow>

          <h2>
            MORE THAN
            <br />
            <em>A FRAGRANCE.</em>
          </h2>

          <p>
            Husnains Edition was created as a complete experience — from the
            first glimpse of the bottle to the moment the fragrance becomes
            part of your day.
          </p>
        </div>

        <div className="edition-grid">
          <div className="edition-main-image">
            <ImageFrame
              src={PRODUCT_IMAGES[1]}
              alt="Husnains Edition bottle"
            />

            <div className="image-label">
              <span>HUSNAINS EDITION</span>
              <small>12 ML / SILENT YAHYA</small>
            </div>
          </div>

          <div className="edition-side">
            <div className="edition-number">01</div>

            <h3>
              CREATED
              <br />
              WITH INTENTION.
            </h3>

            <p>
              The experience begins before the fragrance is even opened.
              Every visual element of the edition is designed to feel
              deliberate, dark and refined.
            </p>

            <GoldRule label="SILENT YAHYA" />

            <div className="mini-stats">
              <div>
                <strong>12</strong>
                <span>ML</span>
              </div>

              <div>
                <strong>01</strong>
                <span>EDITION</span>
              </div>

              <div>
                <strong>SY</strong>
                <span>HOUSE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FragranceSection() {
  return (
    <section className="section fragrance-section" id="fragrance">
      <div className="section-shell">
        <div className="fragrance-top">
          <div>
            <SectionEyebrow number="03">THE FRAGRANCE</SectionEyebrow>

            <h2>
              THE SCENT
              <br />
              <em>LEAVES THE MEMORY.</em>
            </h2>
          </div>

          <div className="fragrance-intro">
            <span className="quote-mark">“</span>

            <p>
              A fragrance should not need to announce itself. It should become
              recognizable by the trace it leaves behind.
            </p>

            <span className="quote-author">— SILENT YAHYA</span>
          </div>
        </div>

        <div className="fragrance-panel">
          <div className="fragrance-image">
            <ImageFrame
              src={PRODUCT_IMAGES[2]}
              alt="Husnains Edition fragrance"
            />
          </div>

          <div className="fragrance-information">
            <div className="fragrance-title-row">
              <div>
                <span className="micro-label">THE SIGNATURE</span>
                <h3>HUSNAINS</h3>
              </div>

              <span className="fragrance-symbol">✦</span>
            </div>

            <GoldRule />

            <p className="fragrance-description">
              A dark, intimate presentation built around the character of the
              Husnains Edition. The fragrance experience is intentionally
              presented without noise — allowing the bottle, story and scent
              to take the lead.
            </p>

            <div className="scent-grid">
              <div className="scent-item">
                <span>01</span>
                <strong>OPENING</strong>
                <p>Discover the first impression.</p>
              </div>

              <div className="scent-item">
                <span>02</span>
                <strong>HEART</strong>
                <p>Experience the character as it develops.</p>
              </div>

              <div className="scent-item">
                <span>03</span>
                <strong>DRY DOWN</strong>
                <p>The lasting impression of the fragrance.</p>
              </div>
            </div>

            <div className="fragrance-footer">
              <span>12 ML</span>
              <span>HUSNAINS EDITION</span>
              <span>₹999</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CollectionSection() {
  return (
    <section className="section collection-section">
      <div className="section-shell">
        <SectionEyebrow number="04">THE COLLECTION</SectionEyebrow>

        <div className="collection-heading">
          <h2>
            ONE EDITION.
            <br />
            <em>EVERY DETAIL MATTERS.</em>
          </h2>

          <p>
            Product, bottle, packaging and presentation are treated as one
            visual language.
          </p>
        </div>

        <div className="collection-grid">
          {PRODUCT_IMAGES.slice(0, 3).map((image, index) => (
            <div className="collection-card" key={`${image}-${index}`}>
              <div className="collection-card-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <ImageFrame
                src={image}
                alt={`Husnains Edition detail ${index + 1}`}
              />

              <div className="collection-card-footer">
                <div>
                  <span>
                    {index === 0
                      ? "THE BOTTLE"
                      : index === 1
                      ? "THE EDITION"
                      : "THE DETAIL"}
                  </span>
                  <small>HUSNAINS</small>
                </div>

                <span>↗</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PresentationSection() {
  return (
    <section className="section presentation-section" id="presentation">
      <div className="section-shell">
        <SectionEyebrow number="05">THE PRESENTATION</SectionEyebrow>

        <div className="presentation-heading">
          <h2>
            THE BOX
            <br />
            <em>IS PART OF THE EXPERIENCE.</em>
          </h2>
        </div>

        <div className="presentation-layout">
          <div className="presentation-large">
            <ImageFrame
              src={PACKAGING_IMAGES[0]}
              alt="Husnains Edition packaging"
            />

            <div className="presentation-stamp">
              <span>SY</span>
              <small>HUSNAINS</small>
            </div>
          </div>

          <div className="presentation-copy">
            <div className="presentation-copy-top">
              <span>THE PRESENTATION / 01</span>
              <span>✦</span>
            </div>

            <h3>
              FROM THE
              <br />
              FIRST LOOK
              <br />
              TO THE
              <br />
              FIRST SPRAY.
            </h3>

            <p>
              The packaging is designed to make the arrival of the fragrance
              feel intentional. Dark surfaces, precise details and a quiet
              visual language keep the focus on the edition itself.
            </p>

            <GoldRule />

            <div className="presentation-details">
              <div>
                <span>01</span>
                <p>Premium presentation</p>
              </div>

              <div>
                <span>02</span>
                <p>Designed around the edition</p>
              </div>

              <div>
                <span>03</span>
                <p>Built for the unboxing moment</p>
              </div>
            </div>
          </div>
        </div>

        <div className="packaging-strip">
          {PACKAGING_IMAGES.slice(0, 3).map((image, index) => (
            <div key={`${image}-${index}`} className="packaging-card">
              <ImageFrame
                src={image}
                alt={`Husnains packaging ${index + 1}`}
              />
              <span>0{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section className="section story-section" id="story">
      <div className="story-glow" />

      <div className="section-shell">
        <div className="story-layout">
          <div className="story-number">06</div>

          <div className="story-copy">
            <SectionEyebrow number="06">THE STORY</SectionEyebrow>

            <h2>
              SOME FRAGRANCES
              <br />
              <em>ARE EXPERIENCED.</em>
            </h2>

            <p className="story-large">
              Husnains Edition is designed around the idea that a fragrance can
              become part of a memory.
            </p>

            <p>
              Not louder. Not busier. Simply more intentional. The dark visual
              identity, the bottle, the presentation and the reservation
              journey all belong to the same story.
            </p>

            <div className="story-signature">
              <span>SY</span>
              <div>
                <strong>SILENT YAHYA</strong>
                <small>FRAGRANCE HOUSE</small>
              </div>
            </div>
          </div>

          <div className="story-image">
            <ImageFrame
              src={PRODUCT_IMAGES[0]}
              alt="Husnains Edition"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneySection({ onBook }: { onBook: () => void }) {
  const steps = [
    ["01", "BOOK YOUR SLOT", "Begin the private release journey."],
    ["02", "ENTER YOUR DETAILS", "Tell us where the edition should be delivered."],
    ["03", "SECURE PAYMENT", "Complete the ₹999 payment through FamPay/UPI."],
    ["04", "ORDER BEGINS", "Your reservation moves into processing."],
    ["05", "TRACK YOUR ORDER", "Follow your order through its tracking page."],
  ];

  return (
    <section className="section journey-section" id="journey">
      <div className="section-shell">
        <SectionEyebrow number="07">THE JOURNEY</SectionEyebrow>

        <div className="journey-heading">
          <h2>
            FROM
            <br />
            <em>SLOT TO DOOR.</em>
          </h2>

          <p>
            A simple reservation journey designed to make every stage clear.
          </p>
        </div>

        <div className="journey-list">
          {steps.map(([number, title, description]) => (
            <div className="journey-row" key={number}>
              <div className="journey-row-number">{number}</div>

              <div className="journey-row-title">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>

              <div className="journey-row-arrow">↗</div>
            </div>
          ))}
        </div>

        <div className="journey-cta">
          <div>
            <span className="micro-label">HUSNAINS EDITION</span>
            <h3>YOUR SLOT AWAITS.</h3>
          </div>

          <button className="gold-button" onClick={onBook}>
            BOOK MY SLOT <b>↗</b>
          </button>
        </div>
      </div>
    </section>
  );
}

function PoliciesSection() {
  const policies = [
    {
      title: "SHIPPING POLICY",
      text: "Orders are prepared after reservation and payment confirmation. Delivery timing may vary depending on destination and courier operations. Tracking information will be provided when available.",
    },
    {
      title: "REFUND & CANCELLATION",
      text: "Please review the applicable refund and cancellation terms before completing payment. Reservation holds are time-limited and may expire if payment is not completed within the stated window.",
    },
    {
      title: "PAYMENT POLICY",
      text: "Payment for this release is handled through the displayed FamPay/UPI payment details. Payment is manually reviewed before the reservation is marked as secured.",
    },
    {
      title: "TERMS & CONDITIONS",
      text: "By booking a slot, you confirm that the information supplied during reservation is accurate and that you agree to the applicable release terms.",
    },
    {
      title: "PRIVACY POLICY",
      text: "Information submitted during reservation is used for processing the reservation, delivery and order-related communication.",
    },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section policies-section">
      <div className="section-shell policies-shell">
        <div className="policies-intro">
          <SectionEyebrow number="08">INFORMATION</SectionEyebrow>

          <h2>
            BEFORE YOU
            <br />
            <em>RESERVE.</em>
          </h2>

          <p>
            Everything important, presented clearly before you enter the
            reservation journey.
          </p>
        </div>

        <div className="accordion">
          {policies.map((policy, index) => {
            const isOpen = open === index;

            return (
              <div className={`accordion-item ${isOpen ? "open" : ""}`} key={policy.title}>
                <button
                  className="accordion-button"
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  <span>
                    0{index + 1} / {policy.title}
                  </span>

                  <b>{isOpen ? "−" : "+"}</b>
                </button>

                <div className="accordion-content">
                  <p>{policy.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    [
      "What is Husnains Edition?",
      "Husnains Edition is the Silent Yahya fragrance release presented through this reservation experience.",
    ],
    [
      "How much is the edition?",
      "The current release price is ₹999 for the 12 ML edition.",
    ],
    [
      "How does the reservation work?",
      "You select BOOK MY SLOT, complete your delivery details, receive a temporary reservation and then proceed to the payment stage.",
    ],
    [
      "How long is the reservation held?",
      "The current reservation system creates a 10-minute pending hold.",
    ],
    [
      "How is payment handled?",
      "The current experience uses the displayed FamPay/UPI payment details. Payment is manually reviewed.",
    ],
    [
      "Where can I track my order?",
      "After reservation/payment processing, the order tracking experience is available through the reservation tracking page.",
    ],
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="section faq-section">
      <div className="section-shell">
        <SectionEyebrow number="09">FAQ</SectionEyebrow>

        <div className="faq-heading">
          <h2>
            QUESTIONS,
            <br />
            <em>ANSWERED.</em>
          </h2>
        </div>

        <div className="faq-list">
          {faqs.map(([question, answer], index) => {
            const isOpen = open === index;

            return (
              <div className={`faq-item ${isOpen ? "open" : ""}`} key={question}>
                <button onClick={() => setOpen(isOpen ? null : index)}>
                  <span>
                    <small>0{index + 1}</small>
                    {question}
                  </span>

                  <b>{isOpen ? "−" : "+"}</b>
                </button>

                <div className="faq-answer">
                  <p>{answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer({ onBook }: { onBook: () => void }) {
  return (
    <footer className="footer">
      <div className="footer-glow" />

      <div className="section-shell">
        <GoldRule label="SILENT YAHYA" />

        <div className="footer-main">
          <div>
            <Logo />

            <h2>
              LEAVE
              <br />
              <em>THE IMPRESSION.</em>
            </h2>
          </div>

          <div className="footer-right">
            <p>HUSNAINS EDITION</p>
            <strong>₹999</strong>

            <button className="gold-button" onClick={onBook}>
              BOOK MY SLOT <b>↗</b>
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SILENT YAHYA</span>
          <span>HUSNAINS EDITION</span>
          <span>12 ML</span>
        </div>
      </div>
    </footer>
  );
}

function SearchExperience({
  onComplete,
  onBack,
  selectedVariant,
}: {
  onComplete: () => void;
  onBack: () => void;
  selectedVariant: (typeof HUSNAINS_VARIANTS)[number];
}) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 15000;
    const started = Date.now();

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const percentage = Math.min(elapsed / totalDuration, 1);

      setProgress(percentage * 100);

      const calculatedStage = Math.min(
        SEARCH_STAGES.length - 1,
        Math.floor(percentage * SEARCH_STAGES.length)
      );

      setStage(calculatedStage);

      if (percentage >= 1) {
        window.clearInterval(interval);

        window.setTimeout(() => {
          onComplete();
        }, 900);
      }
    }, 70);

    return () => window.clearInterval(interval);
  }, [onComplete]);

  const current = SEARCH_STAGES[stage];

  return (
    <main className="sy-search">
      <div className="sy-search-glow sy-search-glow-a" />
      <div className="sy-search-glow sy-search-glow-b" />
      <div className="sy-search-grid" />

      <div className="sy-search-shell">
        <button className="sy-search-back" onClick={onBack}>
          ← BACK
        </button>

        <div className="sy-search-top">
          <div>
            <span className="sy-search-eyebrow">
              SILENT YAHYA · HUSNAINS EDITION
            </span>
            <h1>
              FINDING
              <span>YOUR SLOT.</span>
            </h1>
            <p>
              We are checking the current private release channel before
              asking for your delivery details.
            </p>
          </div>

          <div className="sy-search-code">
            <span>LIVE RELEASE</span>
            <strong>SY / 01</strong>
          </div>
        </div>

        <div className="sy-search-stage">
          <div className="sy-scanner">
            <div className="sy-scanner-glow" />
            <div className="sy-scanner-ring ring-1" />
            <div className="sy-scanner-ring ring-2" />
            <div className="sy-scanner-ring ring-3" />
            <div className="sy-scanner-ring ring-4" />
            <div className="sy-scanner-sweep" />

            {Array.from({ length: 18 }).map((_, index) => (
              <span
                key={index}
                className="sy-scanner-dot"
                style={
                  {
                    "--dot": index,
                  } as React.CSSProperties
                }
              />
            ))}

            <div className="sy-scanner-center">
              <span>SY</span>
              <small>SCANNING</small>
            </div>
            <div className="sy-signal-graph" aria-hidden="true">
              <svg viewBox="0 0 520 150" preserveAspectRatio="none">
                <path className="sy-graph-grid" d="M0 25H520M0 75H520M0 125H520" />
                <path className="sy-graph-line" d="M0 104 C30 95, 38 110, 60 87 S95 48, 118 76 S154 115, 178 71 S214 34, 238 63 S274 118, 300 78 S338 50, 360 72 S397 104, 420 55 S462 39, 520 28" />
              </svg>
            </div>
          </div>

          <div className="sy-search-info">
            <div className="sy-search-current">
              <div>
                <span>STATUS</span>
                <strong>{current.label}</strong>
              </div>
              <b>{Math.round(progress)}%</b>
            </div>

            <div className="sy-search-query">
              <span>SEARCHING</span>
              <strong>{current.query}</strong>
              <i />
            </div>

            <p>{current.description}</p>

            <div className="sy-search-progress">
              <span style={{ width: `${progress}%` }} />
            </div>

            <div className="sy-search-log">
              {SEARCH_STAGES.map((item, index) => (
                <div
                  key={item.label}
                  className={`${index < stage ? "done" : ""} ${
                    index === stage ? "current" : ""
                  }`}
                >
                  <span>
                    {index < stage
                      ? "✓"
                      : String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <strong>{item.label}</strong>
                    <small>
                      {index < stage
                        ? "CHECK COMPLETE"
                        : index === stage
                        ? "IN PROGRESS"
                        : "WAITING"}
                    </small>
                  </div>
                </div>
              ))}
            </div>

            <div className="sy-search-found">
              <span>✦</span>
              {stage === SEARCH_STAGES.length - 1
                ? "PRELIMINARY MATCH FOUND — CONTINUE TO REQUEST THE POSITION"
                : "SEARCHING THE PRIVATE RELEASE — PLEASE KEEP THIS SCREEN OPEN"}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AddressExperience({
  onComplete,
  onBack,
  selectedVariant,
}: {
  onComplete: (reservation: ReservationData) => void;
  onBack: () => void;
  selectedVariant: (typeof HUSNAINS_VARIANTS)[number];
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, variantKey: selectedVariant.key }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.reservation) {
        throw new Error(
          data?.error || "Unable to secure your reservation."
        );
      }

      onComplete(data.reservation);
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="experience-screen">
      <div className="experience-bg-glow address-glow" />

      <div className="address-container">
        <button className="experience-back" onClick={onBack}>
          ← BACK
        </button>

        <div className="address-header">
          <span className="micro-label">02 / PRIVATE DELIVERY</span>

          <h1>
            SECURE YOUR
            <br />
            <em>DELIVERY DETAILS.</em>
          </h1>

          <p>
            A private release needs a precise destination. Your details are used only to process this reservation.
          </p>

          <div className="experience-variant-summary">
            <span className="sy-variant-swatch" style={{ background: selectedVariant.swatch }} />
            <div>
              <small>SELECTED FINISH</small>
              <strong>{selectedVariant.shortName} · ₹{selectedVariant.price}</strong>
            </div>
          </div>
        </div>

        <form className="address-form" onSubmit={handleSubmit}>
          <div className="form-grid two">
            <label>
              <span>FULL NAME</span>
              <input
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="Your full name"
                required
              />
            </label>

            <label>
              <span>PHONE NUMBER</span>
              <input
                value={form.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                placeholder="Your phone number"
                inputMode="tel"
                required
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              <span>EMAIL ADDRESS</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                placeholder="you@example.com"
                required
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              <span>DELIVERY ADDRESS</span>
              <textarea
                value={form.address}
                onChange={(event) =>
                  updateField("address", event.target.value)
                }
                placeholder="House / flat / street / area"
                rows={4}
                required
              />
            </label>
          </div>

          <div className="form-grid three">
            <label>
              <span>CITY</span>
              <input
                value={form.city}
                onChange={(event) =>
                  updateField("city", event.target.value)
                }
                placeholder="City"
                required
              />
            </label>

            <label>
              <span>STATE</span>
              <select
                value={form.state}
                onChange={(event) =>
                  updateField("state", event.target.value)
                }
                required
              >
                <option value="">Select state</option>
                {STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>PINCODE</span>
              <input
                value={form.pincode}
                onChange={(event) =>
                  updateField(
                    "pincode",
                    event.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="000000"
                inputMode="numeric"
                required
              />
            </label>
          </div>

          <div className="form-notice sy-secure-notice">
            <span>⌁</span>
            <div><strong>PRIVATE &amp; SECURE</strong><small>Your delivery information is transmitted only when you submit this reservation.</small></div>
          </div>

          {error && (
            <div className="form-error">
              <span>!</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="gold-button form-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                CREATING RESERVATION
                <span className="button-spinner" />
              </>
            ) : (
              <>
                CONTINUE
                <b>↗</b>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

function PaymentExperience({
  reservation,
  onSubmitted,
}: {
  reservation: ReservationData;
  onSubmitted: () => void;
}) {
  const [remaining, setRemaining] = useState(
    Math.max(
      new Date(reservation.expiresAt).getTime() - Date.now(),
      0
    )
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining(
        Math.max(
          new Date(reservation.expiresAt).getTime() - Date.now(),
          0
        )
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, [reservation.expiresAt]);

  const expired = remaining <= 0;

  return (
    <main className="experience-screen payment-screen">
      <div className="payment-bg-glow" />

      <div className="payment-container">
        <div className="payment-top">
          <div>
            <span className="micro-label">
              03 / EDITION RESERVED
            </span>

            <h1>
              SECURE
              <br />
              <em>YOUR EDITION.</em>
            </h1>
          </div>

          <div className="reservation-timer">
            <small>RESERVATION HOLD</small>
            <strong>{formatCountdown(remaining)}</strong>
            <span>{expired ? "EXPIRED" : "TIME REMAINING"}</span>
          </div>
        </div>

        <div className="payment-layout">
          <div className="payment-product">
            <div className="payment-image">
              <ImageFrame
                src={getHusnainsVariant(reservation.variantKey || "")?.image || PRODUCT_IMAGES[0]}
                alt={reservation.variantName || "Husnains Edition"}
              />
            </div>

            <div className="payment-product-info">
              <span>YOUR ALLOCATION</span>
              <h2>{reservation.variantName || reservation.slotName || "HUSNAINS EDITION"}</h2>

              <div>
                <span>12 ML</span>
                <i />
                <strong>₹{reservation.price}</strong>
              </div>
            </div>
          </div>

          <div className="payment-card">
            <div className="payment-card-heading">
              <span>PAYMENT / FAMPAY</span>
              <span>₹{reservation.price}</span>
            </div>
            <div className="sy-payment-selected"><span className="sy-variant-swatch" style={{ background: getHusnainsVariant(reservation.variantKey || "")?.swatch || "#111" }} /><div><small>SELECTED EDITION</small><strong>{reservation.variantName || "HUSNAINS"}</strong></div></div>

            <div className="qr-shell">
              <div className="qr-glow" />

              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=12&data=${encodeURIComponent(buildUpiLink(reservation.price, reservation.variantName || "EDITION", reservation.id))}`}
                alt={`UPI payment QR for ₹${reservation.price}`}
                className="payment-qr"
              />

              <div className="qr-corner qr-tl" />
              <div className="qr-corner qr-tr" />
              <div className="qr-corner qr-bl" />
              <div className="qr-corner qr-br" />
            </div>

            <div className="payment-instructions">
              <div className="instruction">
                <span>01</span>
                <p>
                  Scan the QR code with your UPI/FamPay application.
                </p>
              </div>

              <div className="instruction">
                <span>02</span>
                <p>
                  Complete the payment of ₹{reservation.price}.
                </p>
              </div>

              <div className="instruction">
                <span>03</span>
                <p>
                  Return here and confirm that payment has been completed.
                </p>
              </div>
            </div>

            <a
              href={buildUpiLink(reservation.price, reservation.variantName || "EDITION", reservation.id)}
              className="upi-button"
            >
              OPEN UPI PAYMENT <span>↗</span>
            </a>

            <button
              className="gold-button payment-complete"
              onClick={onSubmitted}
              disabled={expired}
            >
              {expired ? "RESERVATION EXPIRED" : "I HAVE COMPLETED PAYMENT"}
              {!expired && <b>✓</b>}
            </button>

            <p className="payment-small-print">
              Payment is manually reviewed before the reservation is marked
              as secured.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function SubmittedExperience({
  reservation,
  selectedVariant,
  onContinue,
}: {
  reservation: ReservationData;
  selectedVariant: (typeof HUSNAINS_VARIANTS)[number];
  onContinue: () => void;
}) {
  const variant = getHusnainsVariant(reservation.variantKey || "") || selectedVariant;
  return (
    <main className="experience-screen submitted-screen sy-premium-screen">
      <div className="sy-premium-screen-bg" />
      <div className="sy-premium-topbar"><span>01 / SILENT YAHYA</span><span>REQUEST RECEIVED</span></div>
      <div className="submitted-container sy-premium-center">
        <div className="sy-success-symbol">✓</div>
        <span className="micro-label">HUSNAINS EDITION · {variant.shortName}</span>
        <h1>WE'VE RECEIVED<br /><em>YOUR REQUEST.</em></h1>
        <p>Your payment submission has been received for manual review. Your selected edition is shown below.</p>

        <div className="sy-received-product">
          <div className="sy-received-ring" />
          <img src={variant.image} alt={`${variant.name} selected edition`} onError={safeImageFallback} />
        </div>

        <div className="sy-received-card">
          <div><span>SELECTED FINISH</span><strong>{variant.shortName}</strong></div>
          <div><span>SIZE</span><strong>12 ML</strong></div>
          <div><span>AMOUNT</span><strong>₹{reservation.price}</strong></div>
          <div><span>RESERVATION</span><strong>{reservation.id}</strong></div>
        </div>

        <button className="gold-button sy-premium-action" onClick={onContinue}>VIEW RESERVATION <b>↗</b></button>
        <small className="submitted-note">Your reservation remains subject to payment verification and release confirmation.</small>
      </div>
    </main>
  );
}

function SuccessExperience({
  reservation,
  selectedVariant,
}: {
  reservation: ReservationData;
  selectedVariant: (typeof HUSNAINS_VARIANTS)[number];
}) {
  return (
    <main className="experience-screen success-screen">
      <div className="success-glow" />

      <div className="success-container">
        <div className="success-mark">
          <span>✦</span>
        </div>

        <span className="micro-label">HUSNAINS EDITION</span>

        <h1>
          YOUR JOURNEY
          <br />
          <em>HAS BEGUN.</em>
        </h1>

        <p>
          Your reservation has been created. Keep your reservation ID for
          future tracking and order updates.
        </p>

        <div className="sy-success-product">
          <div className="sy-success-product-ring" />
          <img src={selectedVariant.image} alt={selectedVariant.name} onError={safeImageFallback} />
          <span>{selectedVariant.shortName} · ₹{reservation.price}</span>
        </div>

        <div className="success-ticket">
          <div className="ticket-top">
            <span>RESERVATION ID</span>
            <strong>{reservation.id}</strong>
          </div>

          <div className="ticket-divider" />

          <div className="ticket-grid">
            <div>
              <span>EDITION</span>
              <strong>HUSNAINS</strong>
            </div>

            <div>
              <span>SLOT</span>
              <strong>
                {reservation.slotName || "ALLOCATED"}
              </strong>
            </div>

            <div>
              <span>ORDER</span>
              <strong>PROCESSING</strong>
            </div>

            <div>
              <span>AMOUNT</span>
              <strong>₹{reservation.price}</strong>
            </div>
          </div>
        </div>

        <a
          className="gold-button tracking-button"
          href={`/tracking/${reservation.id}`}
        >
          TRACK MY ORDER <b>↗</b>
        </a>

        <a href="#top" className="return-link">
          RETURN TO SILENT YAHYA
        </a>
      </div>
    </main>
  );
}

export default function ReleasePage() {
  const [step, setStep] = useState<ExperienceStep>("PRODUCT");
  const [reservation, setReservation] =
    useState<ReservationData | null>(null);

  const [selectedVariantKey, setSelectedVariantKey] = useState("black");
  const selectedVariant =
    getHusnainsVariant(selectedVariantKey) || HUSNAINS_VARIANTS[0];

  const price = selectedVariant.price;

  const isExperience = step !== "PRODUCT";

  const scrollToBooking = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    window.setTimeout(() => {
      setStep("SEARCH");
    }, 450);
  };

  const handleReservationCreated = (
    newReservation: ReservationData
  ) => {
    setReservation(newReservation);
    setStep("PAYMENT");
  };

  const handlePaymentSubmitted = () => {
    setStep("SUBMITTED");
  };

  const experienceContent = useMemo(() => {
    if (!reservation && step === "PAYMENT") return null;

    switch (step) {
      case "SEARCH":
        return (
          <SearchExperience
            onComplete={() => setStep("ADDRESS")}
            onBack={() => setStep("PRODUCT")}
            selectedVariant={selectedVariant}
          />
        );

      case "ADDRESS":
        return (
          <AddressExperience
            onComplete={handleReservationCreated}
            onBack={() => setStep("SEARCH")}
            selectedVariant={selectedVariant}
          />
        );

      case "PAYMENT":
        if (!reservation) return null;

        return (
          <PaymentExperience
            reservation={reservation}
            onSubmitted={handlePaymentSubmitted}
          />
        );

      case "SUBMITTED":
        if (!reservation) return null;

        return (
          <SubmittedExperience
            reservation={reservation}
            selectedVariant={selectedVariant}
            onContinue={() => setStep("SUCCESS")}
          />
        );

      case "SUCCESS":
        if (!reservation) return null;

        return <SuccessExperience reservation={reservation} selectedVariant={selectedVariant} />;

      default:
        return null;
    }
  }, [step, reservation, selectedVariant]);

  if (isExperience) {
    return (
      <>
        {experienceContent}

        <style jsx global>{GLOBAL_STYLES}</style>
      </>
    );
  }

  return (
    <>
      <div className="release-page">
        <TopBar onBook={scrollToBooking} />

        <Hero
          onBook={scrollToBooking}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariantKey}
        />

        <EditionSection />

        <FragranceSection />

        <CollectionSection />

        <PresentationSection />

        <StorySection />

        <JourneySection onBook={scrollToBooking} />

        <PoliciesSection />

        <FAQSection />

        <Footer onBook={scrollToBooking} />

        <div className="mobile-book-bar">
          <div>
            <span>{selectedVariant.shortName} · HUSNAINS</span>
            <strong>₹{price}</strong>
          </div>

          <button onClick={scrollToBooking}>
            BOOK MY SLOT <span>↗</span>
          </button>
        </div>
      </div>

      <style jsx global>{GLOBAL_STYLES}</style>
    </>
  );
}

const GLOBAL_STYLES = `
:root {
  --sy-black: #050505;
  --sy-black-2: #080808;
  --sy-surface: #0d0d0d;
  --sy-surface-2: #111111;
  --sy-surface-3: #151515;

  --sy-gold: #d8ad63;
  --sy-gold-light: #f0c982;
  --sy-gold-dark: #8e6a35;

  --sy-text: #eee7dc;
  --sy-muted: #938d83;
  --sy-border: rgba(216, 173, 99, 0.19);
  --sy-border-soft: rgba(255,255,255,0.07);

  --sy-max: 1440px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  background: #050505;
}

body {
  margin: 0;
  background: #050505;
  color: var(--sy-text);
  font-family:
    Arial,
    Helvetica,
    sans-serif;
}

body,
button,
input,
textarea,
select {
  font-family:
    Arial,
    Helvetica,
    sans-serif;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

::selection {
  background: rgba(216,173,99,0.3);
  color: #fff;
}

/* ==========================================
   GLOBAL
========================================== */

.release-page {
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 50% 7%,
      rgba(216,173,99,0.055),
      transparent 30%
    ),
    #050505;
}

.section {
  position: relative;
  overflow: hidden;
  background: #050505;
}

.section-shell {
  width: min(
    calc(100% - 80px),
    var(--sy-max)
  );
  margin: 0 auto;
}

.section-eyebrow {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 30px;

  color: var(--sy-gold);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.24em;
}

.section-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 27px;
  height: 27px;

  border: 1px solid var(--sy-border);
  border-radius: 50%;

  font-size: 9px;
  letter-spacing: 0;
}

.micro-label {
  color: var(--sy-gold);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.25em;
}

.gold-rule {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  margin: 25px 0;
}

.gold-rule span {
  height: 1px;
  flex: 1;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(216,173,99,0.55)
    );
}

.gold-rule span:last-child {
  background:
    linear-gradient(
      90deg,
      rgba(216,173,99,0.55),
      transparent
    );
}

.gold-rule small {
  color: var(--sy-muted);
  font-size: 8px;
  letter-spacing: 0.2em;
}

.gold-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 25px;

  min-height: 54px;
  padding: 0 25px;

  border: 1px solid rgba(216,173,99,0.65);
  border-radius: 0;

  background:
    linear-gradient(
      135deg,
      #d8ad63,
      #a87c3e
    );

  color: #080706;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;

  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    filter 0.3s ease;
}

.gold-button:hover {
  transform: translateY(-3px);
  filter: brightness(1.08);
  box-shadow:
    0 12px 35px rgba(216,173,99,0.2);
}

.gold-button b {
  font-size: 16px;
}

.gold-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  transform: none;
  box-shadow: none;
}

/* ==========================================
   NAVIGATION
========================================== */

.announcement {
  height: 28px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  border-bottom: 1px solid rgba(216,173,99,0.08);

  background: #060606;

  color: #847d73;
  font-size: 8px;
  letter-spacing: 0.25em;
}

.announcement span {
  color: var(--sy-gold);
}

.nav {
  position: absolute;
  z-index: 20;

  top: 28px;
  left: 0;

  width: 100%;

  border-bottom: 1px solid rgba(216,173,99,0.08);

  background: rgba(5,5,5,0.72);
  backdrop-filter: blur(14px);
}

.nav-inner {
  width: min(
    calc(100% - 50px),
    var(--sy-max)
  );

  min-height: 74px;
  margin: auto;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.brand {
  display: flex;
  align-items: center;
}

.brand-logo {
  display: block;
  width: 105px;
  max-height: 48px;
  object-fit: contain;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 28px;
}

.desktop-nav a {
  position: relative;

  color: #928b80;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.18em;

  transition: color 0.25s ease;
}

.desktop-nav a:hover {
  color: var(--sy-gold-light);
}

.nav-book {
  padding: 11px 16px;

  border: 1px solid rgba(216,173,99,0.35);
  border-radius: 0;

  background: transparent;

  color: var(--sy-gold);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.15em;
}

.nav-book span {
  margin-left: 8px;
}

/* ==========================================
   HERO
========================================== */

.hero {
  position: relative;
  min-height: 850px;
  height: 100svh;
  max-height: 1050px;

  overflow: hidden;

  background:
    radial-gradient(
      ellipse at 50% 55%,
      rgba(216,173,99,0.085),
      transparent 28%
    ),
    radial-gradient(
      ellipse at 50% 100%,
      rgba(216,173,99,0.04),
      transparent 42%
    ),
    #050505;
}

.hero-noise {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  pointer-events: none;

  background-image:
    url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.18'/%3E%3C/svg%3E");
  mix-blend-mode: screen;
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(40px);
}

.hero-glow-one {
  width: 500px;
  height: 500px;
  top: 32%;
  left: 50%;
  transform: translate(-50%, -50%);

  background:
    radial-gradient(
      circle,
      rgba(216,173,99,0.17),
      rgba(216,173,99,0.04) 40%,
      transparent 72%
    );

  animation: heroGlow 5s ease-in-out infinite;
}

.hero-glow-two {
  width: 900px;
  height: 280px;
  bottom: -100px;
  left: 50%;
  transform: translateX(-50%);

  background:
    radial-gradient(
      ellipse,
      rgba(216,173,99,0.11),
      transparent 68%
    );

  filter: blur(50px);
}

@keyframes heroGlow {
  0%,100% {
    transform: translate(-50%, -50%) scale(0.96);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.06);
    opacity: 1;
  }
}

.hero-top-copy {
  position: absolute;
  z-index: 4;

  top: 128px;
  left: 50px;
  right: 50px;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-top-copy > div:first-child {
  display: flex;
  align-items: center;
  gap: 10px;
}

.micro-dot {
  color: var(--sy-gold-dark);
}

.hero-index {
  color: #716b63;
  font-size: 8px;
  letter-spacing: 0.2em;
}

.hero-architecture {
  position: absolute;
  z-index: 1;

  top: 170px;
  bottom: 70px;

  width: 30%;

  border: 1px solid rgba(216,173,99,0.16);

  opacity: 0.85;
}

.arch-left {
  left: -14%;
  border-radius: 240px 240px 0 0;
}

.arch-right {
  right: -14%;
  border-radius: 240px 240px 0 0;
}

.hero-content {
  position: relative;
  z-index: 5;

  width: min(
    calc(100% - 100px),
    1200px
  );

  height: 100%;

  margin: auto;

  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  align-items: center;
  gap: 30px;
}

.hero-copy {
  padding-top: 70px;
}

.hero-copy h1 {
  margin: 0 0 24px;

  color: #e8dfd0;

  font-size: clamp(
    54px,
    7vw,
    112px
  );

  font-weight: 300;
  line-height: 0.84;
  letter-spacing: -0.055em;
}

.hero-copy h1 span {
  display: block;

  color: var(--sy-gold);

  font-size: 0.46em;
  font-weight: 500;
  letter-spacing: 0.18em;

  margin-top: 16px;
}

.hero-description {
  color: #938c82;
  font-size: 12px;
  line-height: 1.9;
}

.hero-price {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 27px 0;

  color: #9a9389;
  font-size: 9px;
  letter-spacing: 0.18em;
}

.hero-price i {
  width: 30px;
  height: 1px;
  background: var(--sy-gold-dark);
}

.hero-price strong {
  color: var(--sy-text);
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0;
}

.hero-button {
  min-width: 220px;
}

.hero-note {
  display: flex;
  align-items: center;
  gap: 8px;

  margin-top: 17px;

  color: #666158;
  font-size: 8px;
  letter-spacing: 0.15em;
}

.hero-note span {
  color: var(--sy-gold);
}

.hero-product {
  position: relative;

  height: 720px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-halo {
  position: absolute;

  width: 450px;
  height: 450px;

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(216,173,99,0.16),
      rgba(216,173,99,0.055) 35%,
      transparent 70%
    );

  filter: blur(10px);

  animation: haloPulse 4.5s ease-in-out infinite;
}

@keyframes haloPulse {
  0%,100% {
    transform: scale(0.92);
    opacity: 0.65;
  }

  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}

.hero-arch {
  position: absolute;

  width: 440px;
  height: 610px;

  bottom: 65px;

  border:
    2px solid
    rgba(216,173,99,0.78);

  border-bottom: 0;

  border-radius: 230px 230px 0 0;

  box-shadow:
    0 0 25px rgba(216,173,99,0.08),
    inset 0 0 30px rgba(216,173,99,0.025);
}

.arch-inner {
  position: absolute;
  inset: 10px;

  border:
    1px solid
    rgba(216,173,99,0.12);

  border-bottom: 0;

  border-radius: 220px 220px 0 0;
}

.hero-orbit {
  position: absolute;

  width: 540px;
  height: 220px;

  border:
    1px solid
    rgba(216,173,99,0.09);

  border-radius: 50%;

  transform: rotate(-7deg);
}

.orbit-one {
  bottom: 160px;
}

.orbit-two {
  bottom: 125px;
  width: 460px;
  opacity: 0.7;
}

.hero-pedestal {
  position: absolute;
  bottom: 62px;

  width: 390px;
  height: 90px;

  perspective: 500px;
}

.pedestal-top {
  position: absolute;
  top: 0;
  left: 50%;

  width: 340px;
  height: 65px;

  transform:
    translateX(-50%)
    rotateX(58deg);

  border:
    1px solid
    rgba(216,173,99,0.28);

  border-radius: 50%;

  background:
    radial-gradient(
      ellipse,
      #272018,
      #090909 67%
    );

  box-shadow:
    0 0 45px rgba(216,173,99,0.12);
}

.pedestal-body {
  position: absolute;

  top: 30px;
  left: 50%;

  width: 325px;
  height: 50px;

  transform: translateX(-50%);

  border:
    1px solid
    rgba(216,173,99,0.18);

  border-radius: 0 0 50% 50%;

  background:
    linear-gradient(
      #16120e,
      #080808
    );
}

.pedestal-reflection {
  position: absolute;

  bottom: -35px;
  left: 50%;

  width: 400px;
  height: 45px;

  transform: translateX(-50%);

  border-radius: 50%;

  background:
    radial-gradient(
      ellipse,
      rgba(216,173,99,0.13),
      transparent 70%
    );

  filter: blur(8px);
}

.hero-bottle {
  position: relative;
  z-index: 5;

  width: 330px;
  height: 470px;

  display: flex;
  align-items: center;
  justify-content: center;

  animation: bottleFloat 5s ease-in-out infinite;
}

@keyframes bottleFloat {
  0%,100% {
    transform: translateY(5px);
  }

  50% {
    transform: translateY(-12px);
  }
}

.hero-bottle img {
  position: relative;
  z-index: 2;

  width: 100%;
  height: 100%;

  object-fit: contain;

  filter:
    drop-shadow(0 25px 25px rgba(0,0,0,0.8))
    drop-shadow(0 0 22px rgba(216,173,99,0.13));
}

.bottle-glow {
  position: absolute;
  inset: 20% 15%;

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(216,173,99,0.22),
      transparent 68%
    );

  filter: blur(35px);
}

.hero-product-caption {
  position: absolute;
  bottom: 17px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  color: var(--sy-gold);

  font-size: 10px;
  letter-spacing: 0.28em;
}

.hero-product-caption small {
  color: #655e54;
  font-size: 7px;
  letter-spacing: 0.2em;
}

.hero-bottom {
  position: absolute;
  z-index: 8;

  left: 50px;
  right: 50px;
  bottom: 25px;

  display: flex;
  align-items: center;
  gap: 25px;
}

.hero-bottom > div:first-child {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 160px;
}

.hero-bottom span {
  color: #70695f;
  font-size: 7px;
  letter-spacing: 0.2em;
}

.hero-bottom i {
  color: var(--sy-gold);
  font-style: normal;
  font-size: 14px;
}

.hero-bottom .gold-rule {
  margin: 0;
}

.hero-bottom-right {
  min-width: 130px;
  text-align: right;
}

/* ==========================================
   EDITION
========================================== */

.edition-section {
  padding: 150px 0;
  border-top: 1px solid rgba(216,173,99,0.08);
}

.edition-heading {
  display: grid;
  grid-template-columns: 0.8fr 1fr 0.7fr;
  align-items: end;
  gap: 50px;
  margin-bottom: 80px;
}

.edition-heading .section-eyebrow {
  align-self: start;
}

.edition-heading h2,
.collection-heading h2,
.presentation-heading h2,
.story-copy h2,
.journey-heading h2,
.policies-intro h2,
.faq-heading h2 {
  margin: 0;

  color: #e9e1d5;

  font-size: clamp(42px, 6vw, 86px);
  font-weight: 300;
  line-height: 0.9;
  letter-spacing: -0.05em;
}

.edition-heading h2 em,
.collection-heading h2 em,
.presentation-heading h2 em,
.story-copy h2 em,
.journey-heading h2 em,
.policies-intro h2 em,
.faq-heading h2 em,
.fragrance-top h2 em,
.search-header h1 em,
.address-header h1 em,
.payment-top h1 em,
.submitted-container h1 em,
.success-container h1 em {
  color: var(--sy-gold);
  font-style: normal;
}

.edition-heading > p {
  margin: 0;

  color: #777066;

  font-size: 12px;
  line-height: 1.9;
}

.edition-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  min-height: 650px;

  border-top: 1px solid var(--sy-border);
  border-bottom: 1px solid var(--sy-border);
}

.edition-main-image {
  position: relative;
  min-height: 650px;

  padding: 35px;

  border-right: 1px solid var(--sy-border);
}

.image-frame {
  position: relative;
  overflow: hidden;

  width: 100%;
  height: 100%;

  background:
    radial-gradient(
      circle at center,
      rgba(216,173,99,0.07),
      transparent 60%
    ),
    #0a0a0a;

  border: 1px solid rgba(216,173,99,0.14);
}

.image-frame img {
  width: 100%;
  height: 100%;

  object-fit: cover;

  transition:
    transform 0.8s cubic-bezier(.2,.7,.2,1),
    filter 0.8s ease;
}

.image-frame:hover img {
  transform: scale(1.035);
  filter: brightness(1.05);
}

.image-shine {
  position: absolute;
  z-index: 2;

  top: -100%;
  left: -60%;

  width: 40%;
  height: 250%;

  transform: rotate(22deg);

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.06),
      transparent
    );

  transition: left 1s ease;
}

.image-frame:hover .image-shine {
  left: 130%;
}

.image-frame-corner {
  position: absolute;
  z-index: 4;

  width: 20px;
  height: 20px;

  border-color: rgba(216,173,99,0.8);
}

.corner-tl {
  top: -1px;
  left: -1px;
  border-top: 1px solid;
  border-left: 1px solid;
}

.corner-tr {
  top: -1px;
  right: -1px;
  border-top: 1px solid;
  border-right: 1px solid;
}

.corner-bl {
  bottom: -1px;
  left: -1px;
  border-bottom: 1px solid;
  border-left: 1px solid;
}

.corner-br {
  bottom: -1px;
  right: -1px;
  border-bottom: 1px solid;
  border-right: 1px solid;
}

.image-label {
  position: absolute;
  left: 35px;
  bottom: 35px;
  z-index: 5;

  display: flex;
  flex-direction: column;
  gap: 7px;
}

.image-label span {
  color: #e8dfd1;
  font-size: 12px;
  letter-spacing: 0.2em;
}

.image-label small {
  color: var(--sy-gold);
  font-size: 7px;
  letter-spacing: 0.2em;
}

.edition-side {
  padding: 55px;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

.edition-number {
  color: var(--sy-gold-dark);
  font-size: 65px;
  font-weight: 200;
  line-height: 1;
}

.edition-side h3 {
  margin: 20px 0;

  color: #ddd4c6;

  font-size: 34px;
  font-weight: 300;
  line-height: 0.98;
  letter-spacing: -0.035em;
}

.edition-side p {
  max-width: 400px;

  color: #777067;

  font-size: 12px;
  line-height: 1.9;
}

.mini-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  margin-top: 20px;

  border-top: 1px solid var(--sy-border);
  border-bottom: 1px solid var(--sy-border);
}

.mini-stats div {
  padding: 18px 10px;
  border-right: 1px solid var(--sy-border);
}

.mini-stats div:last-child {
  border-right: 0;
}

.mini-stats strong {
  display: block;

  color: var(--sy-gold);
  font-size: 20px;
  font-weight: 400;
}

.mini-stats span {
  color: #625c54;
  font-size: 7px;
  letter-spacing: 0.15em;
}

/* ==========================================
   FRAGRANCE
========================================== */

.fragrance-section {
  padding: 150px 0;

  background:
    radial-gradient(
      circle at 80% 50%,
      rgba(216,173,99,0.045),
      transparent 32%
    ),
    #080808;
}

.fragrance-top {
  display: grid;
  grid-template-columns: 1fr 0.55fr;
  align-items: end;
  gap: 80px;

  margin-bottom: 70px;
}

.fragrance-top h2 {
  margin: 0;

  color: #e9e0d2;

  font-size: clamp(44px, 6vw, 86px);
  font-weight: 300;
  line-height: 0.9;
  letter-spacing: -0.055em;
}

.fragrance-intro {
  position: relative;

  padding-left: 30px;

  border-left: 1px solid var(--sy-border);
}

.quote-mark {
  color: var(--sy-gold);
  font-size: 50px;
  line-height: 0.5;
}

.fragrance-intro p {
  margin: 20px 0;

  color: #8b847a;

  font-size: 13px;
  line-height: 1.8;
}

.quote-author {
  color: #625c54;
  font-size: 8px;
  letter-spacing: 0.2em;
}

.fragrance-panel {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;

  min-height: 650px;

  border:
    1px solid
    var(--sy-border);

  background: #0a0a0a;
}

.fragrance-image {
  min-height: 650px;
  padding: 25px;

  border-right: 1px solid var(--sy-border);
}

.fragrance-information {
  padding: 55px;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

.fragrance-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.fragrance-title-row h3 {
  margin: 12px 0 0;

  color: #e8dfd1;

  font-size: 52px;
  font-weight: 300;
  letter-spacing: -0.04em;
}

.fragrance-symbol {
  color: var(--sy-gold);
  font-size: 28px;
}

.fragrance-description {
  max-width: 600px;

  color: #827b72;
  font-size: 13px;
  line-height: 1.9;
}

.scent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  margin-top: 30px;

  border-top: 1px solid var(--sy-border);
  border-bottom: 1px solid var(--sy-border);
}

.scent-item {
  min-height: 150px;
  padding: 20px;

  border-right: 1px solid var(--sy-border);
}

.scent-item:last-child {
  border-right: 0;
}

.scent-item span {
  color: var(--sy-gold-dark);
  font-size: 9px;
}

.scent-item strong {
  display: block;

  margin: 25px 0 8px;

  color: #d8d0c3;

  font-size: 10px;
  letter-spacing: 0.13em;
}

.scent-item p {
  margin: 0;

  color: #625c54;
  font-size: 9px;
  line-height: 1.7;
}

.fragrance-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 28px;

  color: #696258;
  font-size: 8px;
  letter-spacing: 0.2em;
}

.fragrance-footer span:last-child {
  color: var(--sy-gold);
}

/* ==========================================
   COLLECTION
========================================== */

.collection-section {
  padding: 150px 0;
}

.collection-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 40px;

  margin-bottom: 70px;
}

.collection-heading p {
  max-width: 300px;
  margin: 0;

  color: #777067;

  font-size: 11px;
  line-height: 1.8;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  border-top: 1px solid var(--sy-border);
  border-bottom: 1px solid var(--sy-border);
}

.collection-card {
  position: relative;
  min-height: 570px;
  padding: 22px;

  border-right: 1px solid var(--sy-border);
}

.collection-card:last-child {
  border-right: 0;
}

.collection-card-number {
  position: absolute;
  z-index: 5;

  top: 34px;
  left: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 34px;
  height: 34px;

  border: 1px solid rgba(216,173,99,0.45);
  border-radius: 50%;

  background: #0a0a0a;

  color: var(--sy-gold);
  font-size: 8px;
}

.collection-card .image-frame {
  height: 480px;
}

.collection-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 20px 5px 0;
}

.collection-card-footer div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.collection-card-footer span {
  color: #cfc6b8;
  font-size: 9px;
  letter-spacing: 0.15em;
}

.collection-card-footer small {
  color: var(--sy-gold-dark);
  font-size: 7px;
  letter-spacing: 0.2em;
}

/* ==========================================
   PRESENTATION
========================================== */

.presentation-section {
  padding: 150px 0;

  background:
    linear-gradient(
      180deg,
      #050505,
      #0a0908,
      #050505
    );
}

.presentation-heading {
  margin-bottom: 65px;
}

.presentation-layout {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;

  min-height: 700px;

  border:
    1px solid
    var(--sy-border);
}

.presentation-large {
  position: relative;
  min-height: 700px;
  padding: 30px;

  border-right: 1px solid var(--sy-border);
}

.presentation-stamp {
  position: absolute;
  z-index: 6;

  right: 55px;
  bottom: 55px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  color: var(--sy-gold);
}

.presentation-stamp span {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 60px;
  height: 60px;

  border: 1px solid var(--sy-gold-dark);
  border-radius: 50%;

  font-size: 15px;
}

.presentation-stamp small {
  font-size: 7px;
  letter-spacing: 0.2em;
}

.presentation-copy {
  padding: 55px;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

.presentation-copy-top {
  display: flex;
  align-items: center;
  justify-content: space-between;

  color: #6c655b;

  font-size: 8px;
  letter-spacing: 0.2em;
}

.presentation-copy-top span:last-child {
  color: var(--sy-gold);
}

.presentation-copy h3 {
  margin: 45px 0 25px;

  color: #e4dbce;

  font-size: 41px;
  font-weight: 300;
  line-height: 0.98;
  letter-spacing: -0.04em;
}

.presentation-copy > p {
  color: #797269;

  font-size: 12px;
  line-height: 1.9;
}

.presentation-details {
  display: flex;
  flex-direction: column;
}

.presentation-details div {
  display: grid;
  grid-template-columns: 35px 1fr;

  padding: 17px 0;

  border-bottom: 1px solid var(--sy-border);
}

.presentation-details span {
  color: var(--sy-gold);
  font-size: 8px;
}

.presentation-details p {
  margin: 0;

  color: #938b80;
  font-size: 9px;
}

.packaging-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  margin-top: 28px;

  border-top: 1px solid var(--sy-border);
  border-bottom: 1px solid var(--sy-border);
}

.packaging-card {
  position: relative;
  height: 250px;
  padding: 12px;

  border-right: 1px solid var(--sy-border);
}

.packaging-card:last-child {
  border-right: 0;
}

.packaging-card .image-frame {
  height: 100%;
}

.packaging-card > span {
  position: absolute;
  z-index: 5;

  top: 22px;
  left: 22px;

  color: var(--sy-gold);
  font-size: 8px;
}

/* ==========================================
   STORY
========================================== */

.story-section {
  padding: 180px 0;

  background:
    radial-gradient(
      circle at 70% 50%,
      rgba(216,173,99,0.06),
      transparent 34%
    ),
    #060606;
}

.story-glow {
  position: absolute;

  width: 600px;
  height: 600px;

  right: -250px;
  top: 50%;

  transform: translateY(-50%);

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(216,173,99,0.09),
      transparent 65%
    );

  filter: blur(30px);
}

.story-layout {
  display: grid;
  grid-template-columns: 0.15fr 0.9fr 0.75fr;
  align-items: center;
  gap: 55px;
}

.story-number {
  color: rgba(216,173,99,0.25);
  font-size: 100px;
  font-weight: 200;
}

.story-copy .section-eyebrow {
  margin-bottom: 40px;
}

.story-copy h2 {
  margin-bottom: 45px;
}

.story-large {
  max-width: 600px;

  color: #c4baac;

  font-size: 21px;
  line-height: 1.6;
}

.story-copy > p:not(.story-large) {
  max-width: 500px;

  color: #736c63;

  font-size: 11px;
  line-height: 2;
}

.story-signature {
  display: flex;
  align-items: center;
  gap: 14px;

  margin-top: 45px;
}

.story-signature > span {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 45px;
  height: 45px;

  border: 1px solid var(--sy-gold-dark);
  border-radius: 50%;

  color: var(--sy-gold);
  font-size: 10px;
}

.story-signature div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.story-signature strong {
  color: #cfc6b8;
  font-size: 9px;
  letter-spacing: 0.2em;
}

.story-signature small {
  color: #5e584f;
  font-size: 7px;
  letter-spacing: 0.15em;
}

.story-image {
  height: 650px;
}

.story-image .image-frame {
  height: 100%;
}

/* ==========================================
   JOURNEY
========================================== */

.journey-section {
  padding: 150px 0;
}

.journey-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 50px;

  margin-bottom: 75px;
}

.journey-heading p {
  max-width: 300px;
  margin: 0;

  color: #756e65;
  font-size: 11px;
  line-height: 1.9;
}

.journey-list {
  border-top: 1px solid var(--sy-border);
}

.journey-row {
  display: grid;
  grid-template-columns: 0.15fr 1fr 0.1fr;
  align-items: center;

  min-height: 135px;

  border-bottom: 1px solid var(--sy-border);

  transition:
    padding 0.35s ease,
    background 0.35s ease;
}

.journey-row:hover {
  padding: 0 20px;

  background:
    linear-gradient(
      90deg,
      rgba(216,173,99,0.025),
      transparent
    );
}

.journey-row-number {
  color: var(--sy-gold-dark);
  font-size: 10px;
}

.journey-row-title h3 {
  margin: 0 0 9px;

  color: #ddd4c6;

  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0.04em;
}

.journey-row-title p {
  margin: 0;

  color: #625c54;
  font-size: 9px;
}

.journey-row-arrow {
  color: var(--sy-gold);
  font-size: 18px;
}

.journey-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 70px;
  padding: 45px;

  border:
    1px solid
    var(--sy-border);

  background:
    radial-gradient(
      circle at 80% 50%,
      rgba(216,173,99,0.08),
      transparent 35%
    ),
    #0a0a0a;
}

.journey-cta h3 {
  margin: 12px 0 0;

  color: #e5dccf;

  font-size: 33px;
  font-weight: 300;
  letter-spacing: -0.03em;
}

/* ==========================================
   POLICIES
========================================== */

.policies-section {
  padding: 150px 0;

  background: #080808;
}

.policies-shell {
  display: grid;
  grid-template-columns: 0.6fr 1.1fr;
  gap: 90px;
}

.policies-intro p {
  max-width: 320px;

  margin-top: 35px;

  color: #736c63;
  font-size: 11px;
  line-height: 1.9;
}

.accordion {
  border-top: 1px solid var(--sy-border);
}

.accordion-item {
  border-bottom: 1px solid var(--sy-border);
}

.accordion-button {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 24px 0;

  border: 0;
  background: transparent;

  color: #a39a8e;

  text-align: left;
}

.accordion-button span {
  font-size: 9px;
  letter-spacing: 0.17em;
}

.accordion-button b {
  color: var(--sy-gold);

  font-size: 17px;
  font-weight: 300;
}

.accordion-content {
  display: grid;
  grid-template-rows: 0fr;

  transition: grid-template-rows 0.35s ease;
}

.accordion-content p {
  overflow: hidden;

  margin: 0;

  color: #716a61;
  font-size: 11px;
  line-height: 1.9;
}

.accordion-item.open .accordion-content {
  grid-template-rows: 1fr;
}

.accordion-item.open .accordion-content p {
  padding: 0 45px 25px 0;
}

/* ==========================================
   FAQ
========================================== */

.faq-section {
  padding: 150px 0;
}

.faq-heading {
  margin: 55px 0;
}

.faq-list {
  border-top: 1px solid var(--sy-border);
}

.faq-item {
  border-bottom: 1px solid var(--sy-border);
}

.faq-item button {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 27px 0;

  border: 0;
  background: transparent;

  color: #b5ab9d;

  text-align: left;
}

.faq-item button span {
  display: flex;
  align-items: center;
  gap: 25px;

  font-size: 13px;
}

.faq-item button small {
  color: var(--sy-gold);
  font-size: 8px;
}

.faq-item button b {
  color: var(--sy-gold);

  font-size: 18px;
  font-weight: 300;
}

.faq-answer {
  display: grid;
  grid-template-rows: 0fr;

  transition: grid-template-rows 0.35s ease;
}

.faq-answer p {
  overflow: hidden;

  margin: 0;

  color: #716a61;
  font-size: 11px;
  line-height: 1.9;
}

.faq-item.open .faq-answer {
  grid-template-rows: 1fr;
}

.faq-item.open .faq-answer p {
  padding: 0 50px 25px 40px;
}

/* ==========================================
   FOOTER
========================================== */

.footer {
  position: relative;

  padding: 90px 0 30px;

  overflow: hidden;

  background: #030303;
}

.footer-glow {
  position: absolute;

  width: 600px;
  height: 300px;

  left: 50%;
  top: 0;

  transform: translateX(-50%);

  background:
    radial-gradient(
      ellipse,
      rgba(216,173,99,0.09),
      transparent 68%
    );

  filter: blur(30px);
}

.footer-main {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: end;
  justify-content: space-between;

  padding: 80px 0;
}

.footer-main .brand-logo {
  margin-bottom: 45px;
}

.footer-main h2 {
  margin: 0;

  color: #ddd4c7;

  font-size: clamp(50px, 7vw, 105px);
  font-weight: 300;
  line-height: 0.86;
  letter-spacing: -0.06em;
}

.footer-main h2 em {
  color: var(--sy-gold);
  font-style: normal;
}

.footer-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.footer-right p {
  color: #706960;
  font-size: 8px;
  letter-spacing: 0.2em;
}

.footer-right strong {
  color: #e2d8ca;
  font-size: 25px;
  font-weight: 400;
}

.footer-bottom {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-top: 20px;

  border-top: 1px solid rgba(216,173,99,0.09);

  color: #4f4a43;
  font-size: 7px;
  letter-spacing: 0.18em;
}

.mobile-book-bar {
  display: none;
}

/* ==========================================
   EXPERIENCE SCREENS
========================================== */

.experience-screen {
  position: fixed;
  z-index: 999;

  inset: 0;

  overflow-y: auto;

  min-height: 100vh;

  background:
    radial-gradient(
      circle at 50% 35%,
      rgba(216,173,99,0.07),
      transparent 28%
    ),
    #050505;

  color: var(--sy-text);
}

.experience-bg-glow {
  position: fixed;

  width: 700px;
  height: 700px;

  top: 20%;
  left: 50%;

  transform: translate(-50%, -50%);

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(216,173,99,0.09),
      transparent 68%
    );

  filter: blur(35px);
  pointer-events: none;
}

.experience-grid {
  position: fixed;
  inset: 0;

  opacity: 0.4;
  pointer-events: none;

  background-image:
    linear-gradient(
      rgba(216,173,99,0.025) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(216,173,99,0.025) 1px,
      transparent 1px
    );

  background-size: 70px 70px;
}

.experience-back {
  position: absolute;

  top: 35px;
  left: 35px;

  padding: 10px 0;

  border: 0;
  background: transparent;

  color: #716a60;
  font-size: 8px;
  letter-spacing: 0.2em;
}

.search-container,
.address-container,
.payment-container,
.submitted-container,
.success-container {
  position: relative;
  z-index: 5;

  width: min(
    calc(100% - 60px),
    1100px
  );

  margin: 0 auto;
}

/* ==========================================
   SEARCH
========================================== */

.search-container {
  min-height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 100px 0 50px;
}

.search-header {
  text-align: center;
}

.search-header h1 {
  margin: 15px 0;

  color: #e6ddd0;

  font-size: clamp(50px, 7vw, 90px);
  font-weight: 300;
  line-height: 0.9;
  letter-spacing: -0.06em;
}

.search-header p {
  margin: 0;

  color: #716a61;
  font-size: 11px;
}

.scanner {
  position: relative;

  width: 330px;
  height: 330px;

  margin: 55px auto 45px;
}

.scanner-ring {
  position: absolute;

  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);

  border-radius: 50%;

  border: 1px solid rgba(216,173,99,0.18);
}

.ring-a {
  width: 100%;
  height: 100%;

  animation: scanRing 4s linear infinite;
}

.ring-b {
  width: 75%;
  height: 75%;

  border-color: rgba(216,173,99,0.3);

  animation: scanRing 5s linear infinite reverse;
}

.ring-c {
  width: 45%;
  height: 45%;

  border-color: rgba(216,173,99,0.4);

  animation: scanRing 3s linear infinite;
}

@keyframes scanRing {
  from {
    transform:
      translate(-50%, -50%)
      rotate(0deg);
  }

  to {
    transform:
      translate(-50%, -50%)
      rotate(360deg);
  }
}

.scanner-sweep {
  position: absolute;

  top: 50%;
  left: 50%;

  width: 50%;
  height: 1px;

  transform-origin: left center;

  background:
    linear-gradient(
      90deg,
      rgba(216,173,99,0.9),
      transparent
    );

  box-shadow:
    0 0 18px rgba(216,173,99,0.6);

  animation: scannerSweep 2.2s linear infinite;
}

@keyframes scannerSweep {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.scanner-center {
  position: absolute;

  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);

  width: 92px;
  height: 92px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(216,173,99,0.45);
  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      #17120d,
      #070707
    );

  box-shadow:
    0 0 35px rgba(216,173,99,0.1);
}

.scanner-center span {
  color: var(--sy-gold);
  font-size: 20px;
}

.scanner-center small {
  margin-top: 5px;

  color: #655e54;
  font-size: 6px;
  letter-spacing: 0.25em;
}

.scanner-dot {
  position: absolute;

  top: 50%;
  left: 50%;

  width: 5px;
  height: 5px;

  margin:
    calc(-2.5px + 0px)
    0
    0
    -2.5px;

  border-radius: 50%;

  background: var(--sy-gold);

  transform:
    rotate(calc(var(--dot-index) * 30deg))
    translateY(-150px);

  box-shadow:
    0 0 12px rgba(216,173,99,0.6);
}

.search-status {
  width: min(600px, 100%);

  text-align: center;
}

.search-status-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  color: var(--sy-gold);

  font-size: 9px;
  letter-spacing: 0.18em;
}

.search-status-title strong {
  font-weight: 400;
}

.search-status > p {
  margin: 12px 0 20px;

  color: #696259;

  font-size: 9px;
}

.progress-track {
  width: 100%;
  height: 1px;

  background: rgba(216,173,99,0.1);
}

.progress-track div {
  height: 100%;

  background:
    linear-gradient(
      90deg,
      var(--sy-gold-dark),
      var(--sy-gold-light)
    );

  box-shadow:
    0 0 12px rgba(216,173,99,0.35);

  transition: width 0.15s linear;
}

.search-steps {
  display: grid;
  grid-template-columns: repeat(6, 1fr);

  width: min(900px, 100%);
  margin-top: 50px;

  border-top: 1px solid var(--sy-border);
  border-bottom: 1px solid var(--sy-border);
}

.search-step {
  position: relative;

  min-height: 80px;

  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 12px;

  border-right: 1px solid var(--sy-border);

  opacity: 0.4;
}

.search-step:last-child {
  border-right: 0;
}

.search-step.active {
  opacity: 1;
}

.search-step.current {
  background:
    radial-gradient(
      circle at center,
      rgba(216,173,99,0.08),
      transparent 70%
    );
}

.search-step span {
  color: var(--sy-gold);
  font-size: 9px;
}

.search-step small {
  margin-top: 8px;

  color: #81796f;
  font-size: 6px;
  letter-spacing: 0.12em;
}

.search-footer {
  display: flex;
  align-items: center;
  gap: 15px;

  margin-top: 35px;

  color: #4f4a43;
  font-size: 7px;
  letter-spacing: 0.2em;
}

.search-footer span:nth-child(2) {
  color: var(--sy-gold);
}

/* ==========================================
   ADDRESS
========================================== */

.address-container {
  min-height: 100vh;

  padding: 120px 0 70px;
}

.address-header {
  max-width: 850px;
  margin-bottom: 55px;
}

.address-header h1 {
  margin: 18px 0;

  color: #e7ded0;

  font-size: clamp(45px, 7vw, 88px);
  font-weight: 300;
  line-height: 0.9;
  letter-spacing: -0.06em;
}

.address-header p {
  margin: 0;

  color: #716a61;
  font-size: 11px;
}

.address-form {
  padding: 40px;

  border:
    1px solid
    var(--sy-border);

  background:
    linear-gradient(
      135deg,
      rgba(216,173,99,0.035),
      transparent 35%
    ),
    #090909;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  margin-bottom: 20px;
}

.form-grid.two {
  grid-template-columns: repeat(2, 1fr);
}

.form-grid.three {
  grid-template-columns: 1fr 1fr 0.7fr;
}

.address-form label {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.address-form label > span {
  color: #756e65;
  font-size: 7px;
  letter-spacing: 0.18em;
}

.address-form input,
.address-form textarea,
.address-form select {
  width: 100%;

  border:
    1px solid
    rgba(216,173,99,0.14);

  border-radius: 0;

  outline: none;

  padding: 15px;

  background:
    linear-gradient(
      180deg,
      #0f0f0f,
      #0a0a0a
    );

  color: #ddd4c7;

  font-size: 11px;

  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.address-form textarea {
  resize: vertical;
}

.address-form input::placeholder,
.address-form textarea::placeholder {
  color: #49453f;
}

.address-form select {
  appearance: none;
}

.address-form input:focus,
.address-form textarea:focus,
.address-form select:focus {
  border-color: rgba(216,173,99,0.55);

  box-shadow:
    0 0 0 3px rgba(216,173,99,0.045);
}

.form-notice {
  display: flex;
  align-items: center;
  gap: 10px;

  margin: 30px 0;

  color: #676057;
  font-size: 8px;
}

.form-notice span {
  color: var(--sy-gold);
}

.form-error {
  margin-bottom: 20px;
  padding: 14px;

  border: 1px solid rgba(170,75,65,0.35);

  background: rgba(100,35,30,0.12);

  color: #b98278;
  font-size: 9px;
}

.form-error span {
  margin-right: 8px;
  color: #d0a095;
}

.form-submit {
  width: 100%;
}

.button-spinner {
  width: 13px;
  height: 13px;

  border:
    1px solid
    rgba(0,0,0,0.25);

  border-top-color: #050505;

  border-radius: 50%;

  animation: buttonSpin 0.7s linear infinite;
}

@keyframes buttonSpin {
  to {
    transform: rotate(360deg);
  }
}

/* ==========================================
   PAYMENT
========================================== */

.payment-container {
  padding: 100px 0 60px;
}

.payment-top {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 30px;

  margin-bottom: 50px;
}

.payment-top h1 {
  margin: 18px 0 0;

  color: #e7ded0;

  font-size: clamp(48px, 7vw, 90px);
  font-weight: 300;
  line-height: 0.86;
  letter-spacing: -0.06em;
}

.reservation-timer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  min-width: 170px;

  padding: 20px;

  border:
    1px solid
    var(--sy-border);

  background: #090909;
}

.reservation-timer small {
  color: #635d54;
  font-size: 7px;
  letter-spacing: 0.15em;
}

.reservation-timer strong {
  margin: 8px 0;

  color: var(--sy-gold);

  font-size: 31px;
  font-weight: 300;
  letter-spacing: 0.04em;
}

.reservation-timer span {
  color: #5a544c;
  font-size: 7px;
  letter-spacing: 0.15em;
}

.payment-layout {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;

  border:
    1px solid
    var(--sy-border);
}

.payment-product {
  padding: 25px;

  border-right: 1px solid var(--sy-border);
}

.payment-image {
  height: 480px;
}

.payment-product-info {
  padding: 25px 5px 5px;
}

.payment-product-info > span {
  color: #625c54;
  font-size: 7px;
  letter-spacing: 0.2em;
}

.payment-product-info h2 {
  margin: 12px 0 20px;

  color: #ddd4c7;

  font-size: 21px;
  font-weight: 300;
}

.payment-product-info > div {
  display: flex;
  align-items: center;
  gap: 12px;

  color: #706960;
  font-size: 8px;
  letter-spacing: 0.15em;
}

.payment-product-info i {
  width: 20px;
  height: 1px;
  background: var(--sy-gold-dark);
}

.payment-product-info strong {
  color: var(--sy-gold);
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0;
}

.payment-card {
  padding: 45px;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.payment-card-heading {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 30px;

  color: #716a61;
  font-size: 8px;
  letter-spacing: 0.18em;
}

.payment-card-heading span:last-child {
  color: var(--sy-gold);
  font-size: 16px;
  letter-spacing: 0;
}

.qr-shell {
  position: relative;

  width: min(300px, 80vw);
  aspect-ratio: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(216,173,99,0.25);

  background: #f0ece4;

  box-shadow:
    0 0 70px rgba(216,173,99,0.08);
}

.qr-glow {
  position: absolute;
  inset: -30px;

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(216,173,99,0.1),
      transparent 70%
    );

  filter: blur(20px);

  pointer-events: none;
}

.payment-qr {
  position: relative;
  z-index: 3;

  width: 82%;
  height: 82%;

  object-fit: contain;
}

.qr-corner {
  position: absolute;
  z-index: 5;

  width: 18px;
  height: 18px;

  border-color: #b3874b;
}

.qr-tl {
  top: 8px;
  left: 8px;

  border-top: 1px solid;
  border-left: 1px solid;
}

.qr-tr {
  top: 8px;
  right: 8px;

  border-top: 1px solid;
  border-right: 1px solid;
}

.qr-bl {
  bottom: 8px;
  left: 8px;

  border-bottom: 1px solid;
  border-left: 1px solid;
}

.qr-br {
  bottom: 8px;
  right: 8px;

  border-bottom: 1px solid;
  border-right: 1px solid;
}

.payment-instructions {
  width: 100%;
  margin-top: 35px;

  border-top: 1px solid var(--sy-border);
}

.instruction {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 10px;

  padding: 15px 0;

  border-bottom: 1px solid var(--sy-border);
}

.instruction span {
  color: var(--sy-gold);
  font-size: 8px;
}

.instruction p {
  margin: 0;

  color: #777067;
  font-size: 9px;
  line-height: 1.7;
}

.upi-button {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;

  margin-top: 25px;
  padding: 15px;

  border:
    1px solid
    rgba(216,173,99,0.25);

  color: var(--sy-gold);

  font-size: 8px;
  letter-spacing: 0.16em;
}

.upi-button span {
  font-size: 14px;
}

.payment-complete {
  width: 100%;
  margin-top: 10px;
}

.payment-small-print {
  max-width: 500px;

  margin: 15px 0 0;

  color: #4f4a43;

  font-size: 7px;
  line-height: 1.7;
  text-align: center;
}

/* ==========================================
   SUBMITTED
========================================== */

.submitted-container,
.success-container {
  min-height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 80px 0;

  text-align: center;
}

.submitted-glow,
.success-glow {
  position: fixed;

  width: 600px;
  height: 600px;

  left: 50%;
  top: 40%;

  transform: translate(-50%, -50%);

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(216,173,99,0.1),
      transparent 68%
    );

  filter: blur(35px);
}

.submitted-icon,
.success-mark {
  position: relative;

  width: 85px;
  height: 85px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 30px;

  border:
    1px solid
    rgba(216,173,99,0.45);

  border-radius: 50%;

  background: #0b0b0b;

  color: var(--sy-gold);

  box-shadow:
    0 0 40px rgba(216,173,99,0.08);
}

.submitted-icon span {
  font-size: 30px;
}

.submitted-container h1,
.success-container h1 {
  position: relative;

  margin: 20px 0;

  color: #e7ded0;

  font-size: clamp(45px, 7vw, 90px);
  font-weight: 300;
  line-height: 0.88;
  letter-spacing: -0.06em;
}

.submitted-container > p,
.success-container > p {
  position: relative;

  max-width: 550px;

  color: #706960;

  font-size: 11px;
  line-height: 1.9;
}

.submitted-card,
.success-ticket {
  position: relative;

  width: min(700px, 100%);

  margin: 40px 0;

  border:
    1px solid
    var(--sy-border);

  background: #090909;
}

.submitted-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.submitted-card > div {
  padding: 25px;

  border-right: 1px solid var(--sy-border);
}

.submitted-card > div:last-child {
  border-right: 0;
}

.submitted-card span,
.ticket-top span,
.ticket-grid span {
  display: block;

  color: #5d574f;
  font-size: 7px;
  letter-spacing: 0.17em;
}

.submitted-card strong,
.ticket-top strong,
.ticket-grid strong {
  display: block;

  margin-top: 10px;

  color: #d7cec0;
  font-size: 11px;
  font-weight: 400;
}

.submitted-note {
  position: relative;

  max-width: 500px;
  margin-top: 20px;

  color: #4d4841;
  font-size: 7px;
  line-height: 1.8;
}

/* ==========================================
   SUCCESS
========================================== */

.success-mark span {
  font-size: 25px;

  animation:
    successPulse 2s ease-in-out infinite;
}

@keyframes successPulse {
  0%,100% {
    transform: scale(0.9);
    opacity: 0.65;
  }

  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

.success-ticket {
  text-align: left;

  padding: 25px;
}

.ticket-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.ticket-top strong {
  color: var(--sy-gold);
}

.ticket-divider {
  height: 1px;

  margin: 25px 0;

  background:
    repeating-linear-gradient(
      90deg,
      var(--sy-border) 0 8px,
      transparent 8px 14px
    );
}

.ticket-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.tracking-button {
  position: relative;
}

.return-link {
  position: relative;

  margin-top: 20px;

  color: #615b53;
  font-size: 7px;
  letter-spacing: 0.2em;
}

/* ==========================================
   RESPONSIVE
========================================== */

@media (max-width: 1100px) {
  .desktop-nav {
    gap: 16px;
  }

  .hero-content {
    grid-template-columns: 0.75fr 1.25fr;
  }

  .hero-product {
    transform: scale(0.9);
  }

  .edition-heading {
    grid-template-columns: 0.5fr 1fr 0.7fr;
  }

  .story-layout {
    grid-template-columns: 0.08fr 1fr 0.8fr;
  }
}

@media (max-width: 850px) {
  .section-shell {
    width: min(
      calc(100% - 36px),
      var(--sy-max)
    );
  }

  .desktop-nav {
    display: none;
  }

  .nav-inner {
    width: calc(100% - 30px);
  }

  .hero {
    min-height: 880px;
    height: auto;
  }

  .hero-top-copy {
    top: 115px;
    left: 20px;
    right: 20px;
  }

  .hero-content {
    width: calc(100% - 36px);

    padding-top: 145px;
    padding-bottom: 90px;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .hero-copy {
    width: 100%;
    padding-top: 0;

    text-align: center;
  }

  .hero-copy .section-eyebrow {
    justify-content: center;
  }

  .hero-copy h1 {
    font-size: clamp(52px, 15vw, 80px);
  }

  .hero-description {
    font-size: 10px;
  }

  .hero-price {
    justify-content: center;
  }

  .hero-product {
    width: 100%;
    height: 500px;

    margin-top: -15px;

    transform: scale(0.78);
  }

  .hero-bottom {
    left: 18px;
    right: 18px;
  }

  .hero-bottom .gold-rule {
    display: none;
  }

  .hero-bottom-right {
    margin-left: auto;
  }

  .edition-section,
  .fragrance-section,
  .collection-section,
  .presentation-section,
  .story-section,
  .journey-section,
  .policies-section,
  .faq-section {
    padding: 100px 0;
  }

  .edition-heading,
  .fragrance-top,
  .collection-heading,
  .journey-heading,
  .policies-shell,
  .story-layout {
    display: block;
  }

  .edition-heading > p {
    margin-top: 30px;
  }

  .edition-grid,
  .fragrance-panel,
  .presentation-layout {
    display: block;
  }

  .edition-main-image {
    min-height: 500px;
    height: 500px;

    border-right: 0;
    border-bottom: 1px solid var(--sy-border);
  }

  .edition-side {
    padding: 40px 25px;
  }

  .fragrance-intro {
    margin-top: 40px;
  }

  .fragrance-image {
    min-height: 480px;
    height: 480px;

    border-right: 0;
    border-bottom: 1px solid var(--sy-border);
  }

  .fragrance-information {
    padding: 40px 25px;
  }

  .scent-grid {
    grid-template-columns: 1fr;
  }

  .scent-item {
    min-height: auto;

    border-right: 0;
    border-bottom: 1px solid var(--sy-border);
  }

  .scent-item:last-child {
    border-bottom: 0;
  }

  .collection-grid {
    grid-template-columns: 1fr;
  }

  .collection-card {
    min-height: 500px;

    border-right: 0;
    border-bottom: 1px solid var(--sy-border);
  }

  .collection-card:last-child {
    border-bottom: 0;
  }

  .presentation-large {
    min-height: 520px;
    height: 520px;

    border-right: 0;
    border-bottom: 1px solid var(--sy-border);
  }

  .presentation-copy {
    padding: 40px 25px;
  }

  .packaging-strip {
    grid-template-columns: 1fr;
  }

  .packaging-card {
    height: 300px;

    border-right: 0;
    border-bottom: 1px solid var(--sy-border);
  }

  .packaging-card:last-child {
    border-bottom: 0;
  }

  .story-number {
    display: none;
  }

  .story-image {
    height: 520px;
    margin-top: 60px;
  }

  .journey-heading p {
    margin-top: 30px;
  }

  .journey-row {
    grid-template-columns: 45px 1fr 30px;
  }

  .journey-cta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 30px;

    padding: 30px;
  }

  .policies-shell {
    display: block;
  }

  .policies-intro {
    margin-bottom: 60px;
  }

  .footer-main {
    display: block;
  }

  .footer-right {
    align-items: flex-start;
    margin-top: 55px;
  }

  .footer-bottom {
    flex-wrap: wrap;
    gap: 15px;
  }

  .payment-layout {
    display: block;
  }

  .payment-product {
    border-right: 0;
    border-bottom: 1px solid var(--sy-border);
  }

  .payment-top {
    display: block;
  }

  .reservation-timer {
    margin-top: 30px;
    align-items: flex-start;
  }

  .submitted-card {
    grid-template-columns: 1fr;
  }

  .submitted-card > div {
    border-right: 0;
    border-bottom: 1px solid var(--sy-border);
  }

  .submitted-card > div:last-child {
    border-bottom: 0;
  }

  .ticket-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .announcement {
    height: 25px;

    font-size: 6px;
    letter-spacing: 0.16em;
  }

  .nav {
    top: 25px;
  }

  .nav-inner {
    min-height: 62px;
  }

  .brand-logo {
    width: 82px;
    max-height: 38px;
  }

  .nav-book {
    padding: 9px 11px;
    font-size: 6px;
  }

  .section-eyebrow {
    margin-bottom: 22px;
  }

  .hero {
    min-height: 820px;
  }

  .hero-top-copy {
    top: 103px;
  }

  .hero-top-copy .hero-index {
    display: none;
  }

  .hero-content {
    padding-top: 125px;
  }

  .hero-product {
    height: 430px;

    margin-top: -30px;

    transform: scale(0.68);
  }

  .hero-arch {
    width: 350px;
    height: 510px;
  }

  .hero-pedestal {
    transform: scale(0.85);
  }

  .hero-bottle {
    width: 300px;
    height: 420px;
  }

  .hero-bottom {
    bottom: 15px;
  }

  .hero-bottom > div:first-child {
    min-width: auto;
  }

  .hero-bottom-right {
    display: none;
  }

  .edition-heading h2,
  .collection-heading h2,
  .presentation-heading h2,
  .story-copy h2,
  .journey-heading h2,
  .policies-intro h2,
  .faq-heading h2 {
    font-size: 47px;
  }

  .edition-main-image {
    height: 420px;
    min-height: 420px;
    padding: 15px;
  }

  .image-label {
    left: 20px;
    bottom: 20px;
  }

  .edition-side {
    padding: 35px 20px;
  }

  .edition-side h3 {
    font-size: 29px;
  }

  .fragrance-image {
    height: 390px;
    min-height: 390px;
    padding: 15px;
  }

  .fragrance-information {
    padding: 35px 20px;
  }

  .fragrance-title-row h3 {
    font-size: 40px;
  }

  .fragrance-footer {
    gap: 8px;
  }

  .collection-card {
    min-height: 430px;
    padding: 15px;
  }

  .collection-card .image-frame {
    height: 360px;
  }

  .presentation-large {
    min-height: 430px;
    height: 430px;
    padding: 15px;
  }

  .presentation-copy {
    padding: 35px 20px;
  }

  .presentation-copy h3 {
    font-size: 32px;
  }

  .story-large {
    font-size: 17px;
  }

  .story-image {
    height: 420px;
  }

  .journey-row {
    min-height: 120px;
  }

  .journey-row-title h3 {
    font-size: 15px;
  }

  .journey-row-title p {
    line-height: 1.6;
  }

  .journey-cta h3 {
    font-size: 27px;
  }

  .accordion-button {
    padding: 20px 0;
  }

  .accordion-button span {
    max-width: 85%;
    line-height: 1.5;
  }

  .faq-item button span {
    gap: 12px;
    font-size: 11px;
  }

  .footer-main {
    padding: 55px 0;
  }

  .footer-main h2 {
    font-size: 55px;
  }

  .mobile-book-bar {
    position: fixed;
    z-index: 900;

    left: 10px;
    right: 10px;
    bottom: 10px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    padding: 8px;

    border:
      1px solid
      rgba(216,173,99,0.3);

    background:
      rgba(10,10,10,0.93);

    backdrop-filter: blur(18px);

    box-shadow:
      0 15px 50px rgba(0,0,0,0.5);
  }

  .mobile-book-bar > div {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding-left: 8px;
  }

  .mobile-book-bar span {
    color: #706960;
    font-size: 6px;
    letter-spacing: 0.15em;
  }

  .mobile-book-bar strong {
    color: var(--sy-gold);
    font-size: 14px;
    font-weight: 400;
  }

  .mobile-book-bar button {
    min-height: 42px;
    padding: 0 15px;

    border: 0;

    background:
      linear-gradient(
        135deg,
        #d8ad63,
        #a87c3e
      );

    color: #070707;

    font-size: 7px;
    font-weight: 800;
    letter-spacing: 0.1em;
  }

  .mobile-book-bar button span {
    color: #070707;
    font-size: 12px;
    margin-left: 8px;
  }

  .experience-back {
    top: 20px;
    left: 18px;
  }

  .search-container,
  .address-container,
  .payment-container,
  .submitted-container,
  .success-container {
    width: calc(100% - 30px);
  }

  .search-container {
    padding-top: 80px;
  }

  .search-header h1,
  .address-header h1,
  .payment-top h1,
  .submitted-container h1,
  .success-container h1 {
    font-size: 50px;
  }

  .scanner {
    width: 270px;
    height: 270px;
    margin-top: 40px;
  }

  .scanner-dot {
    transform:
      rotate(calc(var(--dot-index) * 30deg))
      translateY(-122px);
  }

  .search-steps {
    grid-template-columns: repeat(3, 1fr);
  }

  .search-step:nth-child(3) {
    border-right: 0;
  }

  .search-step {
    border-bottom: 1px solid var(--sy-border);
  }

  .address-container {
    padding-top: 85px;
  }

  .address-form {
    padding: 20px;
  }

  .form-grid.two,
  .form-grid.three {
    grid-template-columns: 1fr;
  }

  .payment-container {
    padding-top: 85px;
  }

  .payment-card {
    padding: 25px 18px;
  }

  .payment-image {
    height: 360px;
  }

  .qr-shell {
    width: min(260px, 80vw);
  }

  .submitted-card,
  .success-ticket {
    margin-top: 30px;
  }

  .ticket-top {
    display: block;
  }

  .ticket-top strong {
    word-break: break-all;
  }

  .ticket-grid {
    grid-template-columns: 1fr 1fr;
  }

  .success-mark,
  .submitted-icon {
    width: 70px;
    height: 70px;
  }
}


/* ==========================================
   FINAL VISUAL POLISH / HUSNAINS 2.0
   ========================================== */

.release-page,
.experience-screen {
  --sy-black: #030303;
  --sy-black-2: #070707;
  --sy-surface: #0b0b0b;
  --sy-surface-2: #101010;
  --sy-surface-3: #151515;
  --sy-gold: #d7aa5a;
  --sy-gold-light: #f2cc86;
  --sy-gold-dark: #80602d;
  --sy-text: #eee8dc;
  --sy-muted: #888177;
  --sy-border: rgba(215,170,90,.28);
}

body {
  background:#030303 !important;
}

/* sharper premium borders */
.gold-button {
  min-height:58px;
  padding:0 28px;
  border:1px solid rgba(242,204,134,.72);
  background:linear-gradient(135deg,#e0b765 0%,#b27e36 100%);
  box-shadow:0 12px 35px rgba(215,170,90,.10), inset 0 1px 0 rgba(255,255,255,.16);
}

.gold-button:hover {
  box-shadow:0 18px 48px rgba(215,170,90,.20), inset 0 1px 0 rgba(255,255,255,.18);
}

.nav {
  background:rgba(3,3,3,.82);
  border-bottom:1px solid rgba(215,170,90,.16);
}

.announcement {
  background:#020202;
  border-bottom:1px solid rgba(215,170,90,.12);
}

/* ==========================================
   HERO — PRODUCT IS THE HERO
   ========================================== */
.hero {
  min-height:920px;
  background:
    radial-gradient(circle at 70% 48%,rgba(215,170,90,.12),transparent 22%),
    radial-gradient(circle at 50% 62%,rgba(215,170,90,.10),transparent 38%),
    radial-gradient(circle at 50% 100%,rgba(215,170,90,.07),transparent 35%),
    #030303;
}

.hero::before {
  content:"";
  position:absolute;
  z-index:1;
  left:50%;
  top:31%;
  width:min(72vw,850px);
  height:min(72vw,850px);
  transform:translate(-50%,-50%);
  border-radius:50%;
  background:radial-gradient(circle,rgba(215,170,90,.15) 0%,rgba(215,170,90,.055) 25%,transparent 68%);
  filter:blur(16px);
  animation:heroAura 6s ease-in-out infinite;
  pointer-events:none;
}

.hero::after {
  content:"";
  position:absolute;
  z-index:1;
  left:50%;
  bottom:70px;
  width:min(90vw,1050px);
  height:180px;
  transform:translateX(-50%);
  border-radius:50%;
  background:radial-gradient(ellipse,rgba(215,170,90,.18),rgba(215,170,90,.04) 45%,transparent 72%);
  filter:blur(22px);
  pointer-events:none;
}

@keyframes heroAura {
  0%,100% { opacity:.65; transform:translate(-50%,-50%) scale(.94); }
  50% { opacity:1; transform:translate(-50%,-50%) scale(1.06); }
}

.hero-content {
  width:min(calc(100% - 90px),1320px);
  grid-template-columns:minmax(330px,.72fr) minmax(500px,1.28fr);
  gap:20px;
}

.hero-copy {
  position:relative;
  z-index:8;
  padding-top:45px;
}

.hero-copy h1 {
  font-size:clamp(62px,7.3vw,116px);
  line-height:.82;
  letter-spacing:-.065em;
  text-shadow:0 0 35px rgba(255,240,210,.035);
}

.hero-copy h1 span {
  margin-top:20px;
  color:#d9ad62;
}

.hero-description {
  max-width:380px;
  color:#8f877c;
  font-size:12px;
}

.hero-price {
  margin:30px 0;
}

.hero-button {
  min-width:245px;
}

.hero-note {
  opacity:.8;
}

.hero-product {
  height:750px;
  position:relative;
  z-index:7;
  transform:none;
}

.hero-architecture {
  z-index:2;
  border-color:rgba(215,170,90,.12);
}

.hero-halo {
  width:650px;
  height:650px;
  background:radial-gradient(circle,rgba(215,170,90,.20),rgba(215,170,90,.075) 34%,transparent 69%);
  filter:blur(16px);
}

.hero-arch {
  width:510px;
  height:690px;
  bottom:55px;
  border-color:rgba(215,170,90,.62);
  box-shadow:0 0 45px rgba(215,170,90,.08),inset 0 0 45px rgba(215,170,90,.025);
}

.arch-inner {
  border-color:rgba(215,170,90,.18);
}

.hero-orbit {
  width:650px;
  height:260px;
  border-color:rgba(215,170,90,.12);
  box-shadow:0 0 25px rgba(215,170,90,.035);
}

.orbit-one { bottom:175px; }
.orbit-two { bottom:135px; width:560px; }

.hero-pedestal {
  bottom:54px;
  width:460px;
}

.pedestal-top {
  width:400px;
  height:76px;
  box-shadow:0 0 65px rgba(215,170,90,.18);
}

.pedestal-body { width:380px; }
.pedestal-reflection { width:470px; }

.hero-bottle {
  width:470px;
  height:610px;
  transform:translateY(-10px);
}

.hero-bottle img {
  width:100%;
  height:100%;
  object-fit:contain;
  filter:drop-shadow(0 30px 30px rgba(0,0,0,.9)) drop-shadow(0 0 32px rgba(215,170,90,.20));
}

.bottle-glow {
  inset:8% 3%;
  background:radial-gradient(circle,rgba(215,170,90,.30),rgba(215,170,90,.10) 38%,transparent 70%);
  filter:blur(48px);
}

.hero-product-caption {
  bottom:4px;
  padding:9px 20px;
  border:1px solid rgba(215,170,90,.16);
  background:rgba(4,4,4,.42);
  backdrop-filter:blur(8px);
}

.hero-bottom {
  z-index:10;
}

/* ==========================================
   CONTENT SURFACES
   ========================================== */
.section {
  background:
    radial-gradient(circle at 50% 0%,rgba(215,170,90,.025),transparent 32%),
    #030303;
}

.edition-section,
.fragrance-section,
.collection-section,
.presentation-section,
.story-section,
.journey-section,
.policies-section,
.faq-section {
  border-top:1px solid rgba(215,170,90,.12);
}

.image-frame {
  background:radial-gradient(circle at center,rgba(215,170,90,.10),transparent 62%),#080808;
  border:1px solid rgba(215,170,90,.22);
  box-shadow:inset 0 0 70px rgba(215,170,90,.025);
}

.image-frame-corner {
  width:28px;
  height:28px;
  border-color:rgba(242,204,134,.85);
}

.edition-grid,
.fragrance-panel,
.presentation-layout,
.journey-list,
.accordion,
.faq-list {
  border-color:rgba(215,170,90,.22);
}

.collection-card,
.packaging-card,
.journey-row,
.accordion-item,
.faq-item {
  border-color:rgba(215,170,90,.18);
}

.collection-card:hover,
.packaging-card:hover {
  background:rgba(215,170,90,.018);
}

/* ==========================================
   MOBILE — REBUILD THE HERO, DON'T SHRINK IT
   ========================================== */
@media (max-width:850px) {
  .hero {
    min-height:960px;
    height:auto;
    padding-bottom:0;
  }

  .hero::before {
    top:47%;
    width:130vw;
    height:130vw;
    background:radial-gradient(circle,rgba(215,170,90,.18),rgba(215,170,90,.065) 30%,transparent 68%);
    filter:blur(20px);
  }

  .hero::after {
    bottom:90px;
    width:130vw;
    height:210px;
  }

  .hero-top-copy {
    top:104px;
    left:18px;
    right:18px;
  }

  .hero-content {
    width:calc(100% - 28px);
    padding-top:145px;
    padding-bottom:82px;
    display:flex;
    flex-direction:column;
    align-items:stretch;
  }

  .hero-copy {
    padding-top:0;
    text-align:center;
  }

  .hero-copy .section-eyebrow {
    justify-content:center;
  }

  .hero-copy h1 {
    font-size:clamp(55px,16.5vw,82px);
    line-height:.84;
    margin-bottom:20px;
  }

  .hero-copy h1 span {
    font-size:.45em;
    margin-top:14px;
  }

  .hero-description {
    max-width:310px;
    margin:0 auto;
    font-size:10px;
    line-height:1.75;
  }

  .hero-price {
    justify-content:center;
    margin:22px 0;
  }

  .hero-button {
    width:min(100%,300px);
    min-width:0;
    margin:0 auto;
  }

  .hero-note {
    justify-content:center;
    margin-top:13px;
    font-size:7px;
  }

  .hero-product {
    width:100%;
    height:575px;
    margin-top:-5px;
    transform:none;
  }

  .hero-halo {
    width:500px;
    height:500px;
  }

  .hero-arch {
    width:min(92vw,430px);
    height:535px;
    bottom:42px;
  }

  .hero-orbit {
    width:118vw;
    height:190px;
  }

  .orbit-one { bottom:130px; }
  .orbit-two { bottom:96px; width:100vw; }

  .hero-pedestal {
    bottom:38px;
    width:340px;
    height:72px;
  }

  .pedestal-top { width:300px; height:60px; }
  .pedestal-body { width:285px; height:45px; }
  .pedestal-reflection { width:340px; }

  .hero-bottle {
    width:min(92vw,390px);
    height:525px;
    transform:translateY(-12px);
  }

  .hero-bottle img {
    filter:drop-shadow(0 24px 28px rgba(0,0,0,.92)) drop-shadow(0 0 34px rgba(215,170,90,.23));
  }

  .bottle-glow {
    inset:5% -3%;
    filter:blur(42px);
  }

  .hero-product-caption {
    bottom:5px;
    font-size:8px;
  }

  .hero-bottom {
    bottom:13px;
    left:16px;
    right:16px;
  }

  .hero-bottom > div:first-child {
    min-width:0;
  }

  .hero-bottom span {
    font-size:6px;
  }

  .section-shell {
    width:calc(100% - 28px);
  }

  .section-eyebrow {
    font-size:8px;
    letter-spacing:.20em;
  }

  .edition-heading h2,
  .collection-heading h2,
  .presentation-heading h2,
  .story-copy h2,
  .journey-heading h2,
  .policies-intro h2,
  .faq-heading h2 {
    font-size:clamp(42px,12.8vw,62px);
    line-height:.9;
  }

  .edition-section,
  .fragrance-section,
  .collection-section,
  .presentation-section,
  .story-section,
  .journey-section,
  .policies-section,
  .faq-section {
    padding:92px 0;
  }

  .edition-main-image,
  .fragrance-image,
  .presentation-large,
  .story-image {
    min-height:0;
  }

  .edition-main-image { height:500px; }
  .fragrance-image { height:480px; }
  .presentation-large { height:500px; }
  .story-image { height:480px; }

  .collection-card {
    min-height:480px;
  }

  .collection-card .image-frame {
    height:405px;
  }

  .mobile-book-bar {
    left:9px;
    right:9px;
    bottom:9px;
    padding:7px;
    border:1px solid rgba(215,170,90,.36);
    border-radius:2px;
    background:rgba(5,5,5,.94);
    box-shadow:0 18px 60px rgba(0,0,0,.7),0 0 30px rgba(215,170,90,.06);
  }

  .mobile-book-bar button {
    min-height:45px;
    padding:0 18px;
    background:linear-gradient(135deg,#e0b765,#b27e36);
  }
}

@media (max-width:480px) {
  .announcement {
    height:24px;
    font-size:5.5px;
  }

  .nav { top:24px; }

  .nav-inner {
    min-height:59px;
    width:calc(100% - 24px);
  }

  .brand-logo {
    width:76px;
    max-height:34px;
  }

  .nav-book {
    padding:9px 10px;
    font-size:6px;
  }

  .hero {
    min-height:900px;
  }

  .hero-content {
    padding-top:136px;
    width:calc(100% - 22px);
  }

  .hero-copy h1 {
    font-size:clamp(50px,16vw,68px);
  }

  .hero-product {
    height:505px;
    margin-top:0;
  }

  .hero-bottle {
    width:96vw;
    height:455px;
  }

  .hero-arch {
    width:88vw;
    height:470px;
  }

  .hero-halo {
    width:390px;
    height:390px;
  }

  .hero-pedestal {
    width:290px;
    bottom:30px;
  }

  .pedestal-top { width:255px; }
  .pedestal-body { width:240px; }
  .pedestal-reflection { width:290px; }

  .hero-product-caption {
    bottom:-2px;
    padding:7px 13px;
  }

  .hero-bottom-right { display:none; }

  .gold-button {
    min-height:54px;
  }

  .mobile-book-bar strong {
    font-size:13px;
  }

  .mobile-book-bar button {
    min-height:42px;
    padding:0 13px;
    font-size:6.5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}


/* =========================================================
   SILENT YAHYA — CLEAN HERO / ALLOCATION EXPERIENCE
   ========================================================= */

.sy-hero,
.sy-search {
  --v2-bg:#050505;
  --v2-bg2:#090806;
  --v2-panel:#0c0c0b;
  --v2-gold:#d7aa5a;
  --v2-gold-hi:#f1cf91;
  --v2-gold-dim:rgba(215,170,90,.22);
  --v2-text:#f0ebe2;
  --v2-muted:#8f8a82;
  position:relative;
  overflow:hidden;
  background:#050505;
  color:var(--v2-text);
}

.sy-hero {
  min-height:100svh;
  isolation:isolate;
  display:flex;
  flex-direction:column;
}

.sy-hero-bg {
  position:absolute; inset:0; z-index:-5;
  background:
    radial-gradient(ellipse 70% 55% at 50% 68%, rgba(205,150,62,.16), transparent 55%),
    radial-gradient(ellipse 45% 38% at 52% 52%, rgba(255,211,126,.07), transparent 62%),
    linear-gradient(180deg,#030303 0%,#080705 58%,#030303 100%);
}

.sy-hero-glow {
  position:absolute; z-index:-4; pointer-events:none; border-radius:50%; filter:blur(55px);
}
.sy-hero-glow-a { width:70vw; height:55vw; left:15%; top:40%; background:rgba(207,151,57,.11); }
.sy-hero-glow-b { width:45vw; height:45vw; left:28%; top:52%; background:rgba(255,208,119,.08); filter:blur(80px); }

.sy-hero-grain {
  position:absolute; inset:0; z-index:6; pointer-events:none; opacity:.035;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
}

.sy-hero-nav {
  width:min(1380px,calc(100% - 48px)); min-height:76px; margin:0 auto;
  display:grid; grid-template-columns:1fr auto 1fr; align-items:center;
  border-bottom:1px solid rgba(215,170,90,.14); position:relative; z-index:20;
}
.sy-hero-brand { display:flex; align-items:center; min-width:0; }
.sy-hero-brand img { display:block; width:76px; height:42px; object-fit:contain; object-position:left center; }
.sy-hero-nav-meta { display:flex; align-items:center; gap:13px; color:#9e906f; font-size:9px; letter-spacing:.28em; }
.sy-hero-nav-meta i { width:3px; height:3px; border-radius:50%; background:var(--v2-gold); }
.sy-nav-cta {
  justify-self:end; height:44px; padding:0 18px; border:1px solid rgba(215,170,90,.5);
  background:rgba(7,7,6,.72); color:var(--v2-gold-hi); font:700 9px/1 Arial,sans-serif;
  letter-spacing:.2em; cursor:pointer; display:flex; align-items:center; gap:18px; transition:.25s ease;
}
.sy-nav-cta b { font-size:15px; font-weight:400; }
.sy-nav-cta:hover { background:var(--v2-gold); color:#080705; }

.sy-hero-frame { position:absolute; inset:110px 5.5% 70px; pointer-events:none; z-index:-1; }
.sy-frame-line { position:absolute; top:8%; bottom:7%; width:1px; background:linear-gradient(180deg,transparent,rgba(215,170,90,.3) 22%,rgba(215,170,90,.13) 72%,transparent); }
.sy-frame-left { left:0; } .sy-frame-right { right:0; }
.sy-frame-arch { position:absolute; width:62%; height:72%; left:19%; bottom:0; border:1px solid rgba(215,170,90,.24); border-bottom:0; border-radius:420px 420px 0 0; box-shadow:0 -20px 90px rgba(215,170,90,.05); }

.sy-hero-content {
  flex:1; width:min(1260px,calc(100% - 48px)); margin:0 auto;
  display:grid; grid-template-columns:minmax(320px,.82fr) minmax(440px,1.18fr);
  align-items:center; gap:26px; padding:44px 0 42px; position:relative; z-index:2;
}
.sy-hero-copy { position:relative; z-index:4; padding-bottom:10px; }
.sy-kicker { display:flex; align-items:center; gap:14px; margin-bottom:25px; }
.sy-kicker > span { width:40px; height:40px; border:1px solid rgba(215,170,90,.35); border-radius:50%; display:grid; place-items:center; color:var(--v2-gold-hi); font-size:10px; font-weight:700; }
.sy-kicker div { display:flex; gap:12px; align-items:center; }
.sy-kicker strong,.sy-kicker em { font-style:normal; font-size:9px; letter-spacing:.25em; }
.sy-kicker strong { color:#ddd1ba; } .sy-kicker em { color:var(--v2-gold); }
.sy-hero-copy h1 { margin:0; font:500 clamp(58px,7vw,112px)/.84 Arial,sans-serif; letter-spacing:-.075em; color:#f1ede6; }
.sy-hero-copy h1 span { display:block; margin:23px 0 27px 9%; font-size:.43em; font-weight:400; letter-spacing:.24em; color:var(--v2-gold-hi); }
.sy-hero-copy p { margin:0; max-width:390px; color:#8f8b84; font-size:12px; line-height:1.9; }
.sy-desktop-buy { margin-top:36px; }
.sy-price { display:flex; align-items:center; gap:18px; margin-bottom:19px; }
.sy-price small,.sy-mobile-price span { color:#9e9588; font-size:9px; letter-spacing:.25em; }
.sy-price i,.sy-mobile-price i { width:40px; height:1px; background:var(--v2-gold); }
.sy-price strong,.sy-mobile-price strong { color:#eee9df; font-size:23px; font-weight:500; }
.sy-main-cta {
  width:100%; max-width:370px; height:62px; border:1px solid rgba(240,201,130,.75);
  background:linear-gradient(135deg,#e6bd72 0%,#bf8b3e 100%); color:#080705;
  display:flex; align-items:center; justify-content:space-between; padding:0 24px; cursor:pointer;
  font:800 10px/1 Arial,sans-serif; letter-spacing:.22em; box-shadow:0 18px 60px rgba(193,139,57,.12); transition:transform .25s ease,box-shadow .25s ease;
}
.sy-main-cta span { margin:auto; } .sy-main-cta b { font-size:17px; font-weight:400; }
.sy-main-cta:hover { transform:translateY(-2px); box-shadow:0 22px 70px rgba(193,139,57,.2); }
.sy-release-note { display:flex; align-items:center; gap:8px; margin-top:14px; color:#625e57; font-size:8px; letter-spacing:.14em; }
.sy-release-note span { color:var(--v2-gold); }

.sy-hero-product { min-height:620px; position:relative; display:grid; place-items:center; }
.sy-product-light { position:absolute; width:72%; height:72%; border-radius:50%; background:radial-gradient(circle,rgba(235,184,83,.24),rgba(213,155,53,.09) 36%,transparent 70%); filter:blur(30px); }
.sy-product-arch { position:absolute; width:68%; height:88%; bottom:5%; border:1px solid rgba(215,170,90,.36); border-bottom:0; border-radius:420px 420px 0 0; box-shadow:inset 0 0 45px rgba(215,170,90,.025),0 0 40px rgba(215,170,90,.04); }
.sy-product-orbit { position:absolute; border:1px solid rgba(215,170,90,.20); border-radius:50%; transform:rotate(-9deg); box-shadow:0 0 30px rgba(215,170,90,.035); }
.sy-orbit-1 { width:112%; height:31%; bottom:13%; } .sy-orbit-2 { width:96%; height:25%; bottom:21%; opacity:.65; }
.sy-product-floor { position:absolute; width:78%; height:15%; bottom:6%; border-radius:50%; background:radial-gradient(ellipse,rgba(0,0,0,.9),transparent 68%); border-top:1px solid rgba(215,170,90,.23); }
.sy-product-image-wrap { position:relative; width:min(86%,590px); height:min(82vh,680px); display:grid; place-items:center; z-index:3; }
.sy-product-image-wrap::after { content:""; position:absolute; inset:16% 8%; background:radial-gradient(circle,rgba(237,189,93,.2),transparent 65%); filter:blur(35px); z-index:-1; }
.sy-product-image-wrap img { width:100%; height:100%; object-fit:contain; display:block; filter:drop-shadow(0 35px 32px rgba(0,0,0,.95)) drop-shadow(0 0 26px rgba(215,170,90,.22)); animation:syFloat 5.5s ease-in-out infinite; }
.sy-product-label { position:absolute; bottom:2%; display:flex; flex-direction:column; align-items:center; gap:6px; padding:9px 16px; border:1px solid rgba(215,170,90,.18); background:rgba(3,3,3,.55); backdrop-filter:blur(8px); z-index:5; }
.sy-product-label span { font-size:8px; letter-spacing:.24em; color:#d8c7a8; } .sy-product-label small { font-size:6px; letter-spacing:.18em; color:#6f6a61; }
@keyframes syFloat { 0%,100% { transform:translateY(5px); } 50% { transform:translateY(-9px); } }
.sy-mobile-buy { display:none; }
.sy-hero-scroll { width:min(1260px,calc(100% - 48px)); margin:0 auto; padding:13px 0; border-top:1px solid rgba(215,170,90,.12); display:flex; align-items:center; gap:14px; color:#6d665c; font-size:7px; letter-spacing:.25em; }
.sy-hero-scroll i { height:1px; flex:1; background:linear-gradient(90deg,rgba(215,170,90,.2),transparent); } .sy-hero-scroll b { font-size:12px; color:var(--v2-gold); font-weight:400; }

.sy-search { min-height:100svh; display:flex; align-items:center; isolation:isolate; }
.sy-search-glow { position:absolute; border-radius:50%; pointer-events:none; filter:blur(75px); z-index:-2; }
.sy-search-glow-a { width:520px; height:520px; left:50%; top:20%; transform:translateX(-50%); background:rgba(214,164,78,.10); }
.sy-search-glow-b { width:280px; height:280px; left:15%; bottom:5%; background:rgba(214,164,78,.05); }
.sy-search-grid { position:absolute; inset:0; z-index:-1; opacity:.18; background-image:linear-gradient(rgba(215,170,90,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(215,170,90,.055) 1px,transparent 1px); background-size:70px 70px; mask-image:linear-gradient(to bottom,transparent,black 15%,black 85%,transparent); }
.sy-search-shell { width:min(1120px,calc(100% - 42px)); margin:auto; padding:42px 0; }
.sy-search-back { background:none; border:0; color:#777066; font:700 8px Arial; letter-spacing:.18em; cursor:pointer; padding:0; margin-bottom:34px; }
.sy-search-top { display:flex; justify-content:space-between; gap:30px; align-items:flex-end; border-bottom:1px solid rgba(215,170,90,.16); padding-bottom:24px; }
.sy-search-eyebrow { font-size:8px; letter-spacing:.28em; color:var(--v2-gold); }
.sy-search-top h1 { margin:15px 0 0; font:500 clamp(46px,6vw,86px)/.86 Arial; letter-spacing:-.06em; }
.sy-search-top h1 span { display:block; color:var(--v2-gold-hi); font-size:.45em; letter-spacing:.15em; margin:15px 0 0 2px; }
.sy-search-top p { max-width:480px; color:#817c74; font-size:11px; line-height:1.7; margin:20px 0 0; }
.sy-search-code { min-width:145px; border-left:1px solid rgba(215,170,90,.2); padding-left:20px; display:flex; flex-direction:column; gap:8px; }
.sy-search-code span { font-size:7px; color:#706a62; letter-spacing:.2em; } .sy-search-code strong { font-size:18px; color:#d8c49e; letter-spacing:.08em; }
.sy-search-stage { display:grid; grid-template-columns:360px 1fr; gap:64px; align-items:center; padding-top:36px; }
.sy-scanner { height:360px; position:relative; display:grid; place-items:center; }
.sy-scanner-glow { position:absolute; width:230px; height:230px; border-radius:50%; background:rgba(215,170,90,.12); filter:blur(40px); }
.sy-scanner-ring { position:absolute; border:1px solid rgba(215,170,90,.25); border-radius:50%; }
.sy-scanner-ring.ring-1 { width:250px; height:250px; } .sy-scanner-ring.ring-2 { width:292px; height:292px; opacity:.65; } .sy-scanner-ring.ring-3 { width:328px; height:328px; opacity:.4; } .sy-scanner-ring.ring-4 { width:360px; height:360px; opacity:.18; }
.sy-scanner-sweep { position:absolute; width:48%; height:1px; left:26%; top:50%; transform-origin:left center; background:linear-gradient(90deg,var(--v2-gold),transparent); box-shadow:0 0 20px var(--v2-gold); animation:sySweep 2.4s linear infinite; }
@keyframes sySweep { to { transform:rotate(360deg); } }
.sy-scanner-center { width:108px; height:108px; border:1px solid rgba(215,170,90,.45); border-radius:50%; display:flex; flex-direction:column; justify-content:center; align-items:center; background:rgba(5,5,4,.86); box-shadow:0 0 45px rgba(215,170,90,.08); z-index:3; }
.sy-scanner-center span { font:500 32px Georgia,serif; color:var(--v2-gold-hi); } .sy-scanner-center small { font:7px Arial; letter-spacing:.25em; color:#777066; margin-top:4px; }
.sy-scanner-dot { position:absolute; width:4px; height:4px; border-radius:50%; background:var(--v2-gold); top:50%; left:50%; transform:rotate(calc(var(--dot) * 20deg)) translateY(-168px); opacity:.7; box-shadow:0 0 8px rgba(215,170,90,.5); }
.sy-search-current { display:flex; justify-content:space-between; align-items:flex-end; gap:20px; }
.sy-search-current span,.sy-search-query>span { display:block; color:#6f6961; font-size:7px; letter-spacing:.24em; margin-bottom:8px; }
.sy-search-current strong { font-size:24px; letter-spacing:.02em; color:#eee8de; } .sy-search-current>b { font-size:18px; font-weight:400; color:var(--v2-gold); }
.sy-search-query { margin-top:23px; padding:14px 15px; border:1px solid rgba(215,170,90,.16); background:rgba(12,12,10,.72); position:relative; }
.sy-search-query strong { display:block; padding-right:30px; font:500 11px/1.4 "Courier New",monospace; color:#b8a98e; }
.sy-search-query i { position:absolute; right:14px; bottom:13px; width:28px; height:1px; background:var(--v2-gold); animation:syBlink 1s steps(2) infinite; }
@keyframes syBlink { 50% { opacity:.15; } }
.sy-search-info>p { color:#858077; font-size:11px; line-height:1.7; margin:17px 0; }
.sy-search-progress { height:2px; background:rgba(255,255,255,.06); overflow:hidden; }
.sy-search-progress span { display:block; height:100%; background:linear-gradient(90deg,#9c7335,var(--v2-gold-hi)); box-shadow:0 0 12px rgba(215,170,90,.35); transition:width .1s linear; }
.sy-search-log { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:16px; }
.sy-search-log>div { display:flex; gap:11px; align-items:center; min-height:54px; border:1px solid rgba(255,255,255,.06); padding:10px; background:rgba(7,7,6,.58); opacity:.42; transition:all .35s ease; }
.sy-search-log>div.current { opacity:1; border-color:rgba(215,170,90,.34); box-shadow:inset 0 0 25px rgba(215,170,90,.025); }
.sy-search-log>div.done { opacity:.75; border-color:rgba(215,170,90,.11); }
.sy-search-log span { font-size:8px; color:var(--v2-gold); min-width:20px; } .sy-search-log strong { display:block; font-size:8px; letter-spacing:.11em; } .sy-search-log small { display:block; color:#5f5a53; font-size:6px; letter-spacing:.13em; margin-top:4px; }
.sy-search-found { margin-top:18px; padding:14px 0 0; border-top:1px solid rgba(215,170,90,.14); color:#857b68; font-size:7px; letter-spacing:.16em; line-height:1.6; }
.sy-search-found span { color:var(--v2-gold); margin-right:7px; }

@media (max-width:850px) {
  .sy-hero-nav { width:calc(100% - 28px); min-height:62px; grid-template-columns:1fr auto; }
  .sy-hero-brand img { width:62px; height:36px; } .sy-hero-nav-meta { display:none; }
  .sy-nav-cta { height:40px; padding:0 12px; font-size:7px; gap:11px; }
  .sy-hero-frame { inset:92px 18px 58px; } .sy-frame-arch { width:82%; left:9%; height:58%; }
  .sy-hero-content { width:calc(100% - 28px); display:flex; flex-direction:column; gap:0; padding:32px 0 28px; align-items:stretch; }
  .sy-hero-copy { text-align:center; padding:0; display:flex; flex-direction:column; align-items:center; }
  .sy-kicker { margin-bottom:18px; gap:9px; } .sy-kicker>span { width:34px; height:34px; font-size:8px; }
  .sy-kicker div { gap:8px; } .sy-kicker strong,.sy-kicker em { font-size:6.5px; letter-spacing:.19em; }
  .sy-hero-copy h1 { font-size:clamp(48px,15vw,68px); letter-spacing:-.07em; line-height:.88; }
  .sy-hero-copy h1 span { margin:10px 0 14px; font-size:.42em; letter-spacing:.20em; }
  .sy-hero-copy p { font-size:9px; line-height:1.7; max-width:285px; }
  .sy-desktop-buy { display:none; }
  .sy-hero-product { width:100%; height:445px; min-height:0; margin-top:2px; }
  .sy-product-light { width:92%; height:88%; filter:blur(42px); background:radial-gradient(circle,rgba(236,184,78,.25),rgba(215,170,90,.07) 42%,transparent 72%); }
  .sy-product-arch { width:82%; height:88%; bottom:3%; }
  .sy-product-orbit.sy-orbit-1 { width:122%; height:24%; bottom:10%; } .sy-product-orbit.sy-orbit-2 { width:106%; height:20%; bottom:18%; }
  .sy-product-floor { width:88%; bottom:3%; }
  .sy-product-image-wrap { width:100%; height:410px; }
  .sy-product-image-wrap img { filter:drop-shadow(0 28px 26px rgba(0,0,0,.98)) drop-shadow(0 0 28px rgba(215,170,90,.27)); }
  .sy-product-label { bottom:0; padding:7px 12px; } .sy-product-label span { font-size:6.5px; } .sy-product-label small { font-size:5px; }
  .sy-mobile-buy { display:flex; width:min(100%,350px); margin:0 auto; flex-direction:column; align-items:center; }
  .sy-mobile-price { display:flex; align-items:center; gap:15px; margin:3px 0 15px; } .sy-mobile-price span { font-size:8px; } .sy-mobile-price i { width:28px; } .sy-mobile-price strong { font-size:25px; }
  .sy-mobile-buy .sy-main-cta { max-width:none; height:58px; } .sy-mobile-buy .sy-release-note { justify-content:center; margin-top:10px; font-size:6.5px; }
  .sy-hero-scroll { display:none; }

  .sy-search { align-items:flex-start; min-height:100svh; }
  .sy-search-shell { width:calc(100% - 28px); padding:24px 0 36px; }
  .sy-search-back { margin-bottom:24px; }
  .sy-search-top { display:block; padding-bottom:20px; }
  .sy-search-eyebrow { font-size:6.5px; letter-spacing:.24em; }
  .sy-search-top h1 { font-size:clamp(40px,13vw,54px); line-height:.9; margin-top:13px; }
  .sy-search-top h1 span { font-size:.44em; margin-top:12px; }
  .sy-search-top p { font-size:8.5px; line-height:1.7; max-width:310px; margin-top:15px; }
  .sy-search-code { display:none; }
  .sy-search-stage { display:flex; flex-direction:column; gap:8px; padding-top:20px; }
  .sy-scanner { width:100%; height:270px; }
  .sy-scanner-ring.ring-1 { width:190px; height:190px; } .sy-scanner-ring.ring-2 { width:220px; height:220px; } .sy-scanner-ring.ring-3 { width:247px; height:247px; } .sy-scanner-ring.ring-4 { width:270px; height:270px; }
  .sy-scanner-dot { transform:rotate(calc(var(--dot) * 20deg)) translateY(-129px); }
  .sy-search-info { width:100%; }
  .sy-search-current strong { font-size:18px; } .sy-search-current>b { font-size:16px; }
  .sy-search-query { margin-top:15px; padding:12px 13px; } .sy-search-query strong { font-size:8.5px; }
  .sy-search-info>p { font-size:8.5px; margin:11px 0; }
  .sy-search-log { grid-template-columns:1fr; gap:6px; margin-top:12px; }
  .sy-search-log>div { min-height:46px; padding:8px 9px; } .sy-search-log strong { font-size:6.5px; } .sy-search-log small { font-size:5px; }
  .sy-search-found { font-size:6px; margin-top:12px; padding-top:10px; }
}

@media (max-width:480px) {
  .sy-hero-nav { min-height:58px; } .sy-hero-brand img { width:55px; height:32px; }
  .sy-nav-cta { font-size:6px; height:37px; padding:0 10px; letter-spacing:.16em; }
  .sy-hero-frame { inset:88px 13px 52px; }
  .sy-hero-content { width:calc(100% - 20px); padding-top:27px; }
  .sy-kicker { margin-bottom:15px; }
  .sy-hero-copy h1 { font-size:50px; } .sy-hero-copy h1 span { margin:9px 0 13px; } .sy-hero-copy p { font-size:8.3px; }
  .sy-hero-product { height:405px; } .sy-product-image-wrap { height:375px; }
  .sy-product-arch { width:86%; height:84%; }
  .sy-mobile-buy { width:calc(100% - 6px); } .sy-mobile-buy .sy-main-cta { height:59px; }
  .sy-mobile-price strong { font-size:24px; }
  .sy-search-shell { width:calc(100% - 24px); padding-top:20px; }
  .sy-search-top h1 { font-size:40px; }
  .sy-scanner { height:250px; }
  .sy-scanner-ring.ring-1 { width:178px; height:178px; } .sy-scanner-ring.ring-2 { width:205px; height:205px; } .sy-scanner-ring.ring-3 { width:230px; height:230px; } .sy-scanner-ring.ring-4 { width:250px; height:250px; }
  .sy-scanner-dot { transform:rotate(calc(var(--dot) * 20deg)) translateY(-120px); }
}

/* Never let the global mobile booking bar cover the product or CTA. */
@media (max-width:850px) {
  .mobile-book-bar {
    left:12px; right:12px; bottom:calc(10px + env(safe-area-inset-bottom));
    padding:6px; border:1px solid rgba(215,170,90,.32); border-radius:2px;
    background:rgba(5,5,5,.96); box-shadow:0 18px 60px rgba(0,0,0,.75);
    z-index:40;
  }
  .mobile-book-bar button { min-height:44px; padding:0 14px; background:linear-gradient(135deg,#e0b765,#b27e36); }
}


/* =========================================================
   HUSNAINS VARIANT SELECTOR
   ========================================================= */
.sy-variant-picker,
.sy-mobile-variant-picker {
  margin-top: 24px;
  width: min(100%, 430px);
}
.sy-variant-picker-head {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:14px;
  margin-bottom:10px;
}
.sy-variant-picker-head span {
  color:#716a60;
  font-size:7px;
  letter-spacing:.22em;
}
.sy-variant-picker-head strong {
  color:#d9bd82;
  font-size:8px;
  letter-spacing:.15em;
}
.sy-variant-options {
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:7px;
}
.sy-variant-card {
  min-height:70px;
  padding:9px;
  border:1px solid rgba(215,170,90,.13);
  background:rgba(8,8,7,.72);
  color:#e8e1d6;
  display:flex;
  align-items:center;
  gap:8px;
  text-align:left;
  position:relative;
  transition:all .25s ease;
}
.sy-variant-card:hover {
  border-color:rgba(215,170,90,.38);
  transform:translateY(-1px);
}
.sy-variant-card.selected {
  border-color:rgba(240,201,130,.75);
  background:linear-gradient(145deg,rgba(215,170,90,.11),rgba(8,8,7,.9));
  box-shadow:inset 0 0 24px rgba(215,170,90,.035);
}
.sy-variant-swatch {
  width:23px;
  height:23px;
  min-width:23px;
  border-radius:50%;
  border:1px solid rgba(255,255,255,.28);
  box-shadow:0 0 0 3px rgba(255,255,255,.02);
}
.sy-variant-card-copy {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:5px;
}
.sy-variant-card-copy strong {
  font-size:7px;
  letter-spacing:.12em;
  white-space:nowrap;
}
.sy-variant-card-copy small {
  font-size:8px;
  color:#b99b62;
}
.sy-variant-card>b {
  position:absolute;
  right:7px;
  top:6px;
  color:#f0c982;
  font-size:10px;
}
.sy-mobile-variant-picker { display:none; }
.experience-variant-summary {
  display:flex;
  align-items:center;
  gap:11px;
  width:max-content;
  max-width:100%;
  margin-top:20px;
  padding:10px 13px;
  border:1px solid rgba(215,170,90,.16);
  background:rgba(10,10,9,.7);
}
.experience-variant-summary .sy-variant-swatch { width:18px; height:18px; min-width:18px; }
.experience-variant-summary div { display:flex; flex-direction:column; gap:3px; }
.experience-variant-summary small { color:#716a60; font-size:6px; letter-spacing:.18em; }
.experience-variant-summary strong { color:#d9bd82; font-size:8px; letter-spacing:.11em; }

@media (max-width:850px) {
  .sy-desktop-buy > .sy-variant-picker { display:none; }
  .sy-mobile-variant-picker { display:block; width:min(100%,350px); margin:14px auto 0; }
  .sy-mobile-variant-picker .sy-variant-options { gap:5px; }
  .sy-mobile-variant-picker .sy-variant-card { min-height:62px; padding:8px 7px; gap:6px; }
  .sy-mobile-variant-picker .sy-variant-swatch { width:19px; height:19px; min-width:19px; }
  .sy-mobile-variant-picker .sy-variant-card-copy strong { font-size:6px; letter-spacing:.08em; }
  .sy-mobile-variant-picker .sy-variant-card-copy small { font-size:7px; }
  .sy-mobile-variant-picker .sy-variant-card>b { font-size:8px; right:5px; top:4px; }
}
@media (max-width:390px) {
  .sy-mobile-variant-picker { width:100%; }
  .sy-mobile-variant-picker .sy-variant-card { min-height:58px; }
  .sy-mobile-variant-picker .sy-variant-swatch { width:17px; height:17px; min-width:17px; }
  .sy-mobile-variant-picker .sy-variant-card-copy strong { font-size:5.5px; }
  .sy-mobile-variant-picker .sy-variant-card-copy small { font-size:6.5px; }
}

/* =========================================================
   V5 PREMIUM PRODUCT GALLERY + EXPERIENCE SCREENS
   ========================================================= */
.sy-hero { min-height:100svh !important; overflow:hidden; background:#050505; }
.sy-hero-content { position:relative; z-index:4; }
.sy-hero-copy { position:relative; z-index:8; }
.sy-hero-product { position:relative; z-index:5; }
.sy-gallery { width:100%; max-width:650px; margin:0 auto; position:relative; }
.sy-gallery-stage { height:min(72vh,650px); min-height:470px; position:relative; display:grid; place-items:center; overflow:visible; }
.sy-gallery-glow { position:absolute; width:72%; height:72%; border-radius:50%; background:radial-gradient(circle,rgba(231,182,80,.24),rgba(231,182,80,.07) 35%,transparent 72%); filter:blur(28px); animation:syGalleryBreath 5s ease-in-out infinite; }
@keyframes syGalleryBreath { 50%{transform:scale(1.06);opacity:.82;} }
.sy-gallery-arch { position:absolute; width:62%; height:90%; top:3%; border:1px solid rgba(221,178,94,.30); border-bottom:0; border-radius:500px 500px 0 0; box-shadow:0 0 60px rgba(221,178,94,.05),inset 0 0 40px rgba(221,178,94,.025); }
.sy-gallery-floor { position:absolute; width:72%; height:18%; bottom:5%; border-radius:50%; background:radial-gradient(ellipse,rgba(0,0,0,.96),transparent 68%); border-top:1px solid rgba(221,178,94,.22); }
.sy-gallery-main-image { width:min(82%,520px); height:88%; object-fit:contain; position:relative; z-index:3; filter:drop-shadow(0 35px 30px rgba(0,0,0,.95)) drop-shadow(0 0 30px rgba(220,172,76,.19)); animation:syGalleryFloat 5.5s ease-in-out infinite; transition:opacity .25s ease,transform .25s ease; }
@keyframes syGalleryFloat { 50%{transform:translateY(-8px);} }
.sy-gallery-arrow { position:absolute; z-index:7; width:42px; height:42px; border:1px solid rgba(222,180,99,.30); background:rgba(5,5,5,.75); color:#e7c783; border-radius:50%; font-size:27px; line-height:1; display:grid; place-items:center; backdrop-filter:blur(10px); }
.sy-gallery-arrow:hover { border-color:#e7c783; background:rgba(222,180,99,.10); }
.sy-gallery-arrow-left { left:3%; } .sy-gallery-arrow-right { right:3%; }
.sy-gallery-controls { display:flex; justify-content:center; align-items:center; gap:18px; margin-top:-2px; position:relative; z-index:8; }
.sy-gallery-controls>button { width:31px; height:31px; border:1px solid rgba(222,180,99,.24); background:#090909; color:#e4c27d; border-radius:50%; }
.sy-gallery-dots { display:flex; gap:7px; align-items:center; }
.sy-gallery-dots button { width:5px; height:5px; padding:0; border:0; border-radius:50%; background:#514b42; }
.sy-gallery-dots button.active { width:22px; border-radius:10px; background:#d9ae5e; box-shadow:0 0 10px rgba(217,174,94,.35); }
.sy-gallery-thumbs { display:flex; justify-content:center; gap:7px; margin:14px auto 0; max-width:440px; overflow-x:auto; padding:2px 4px 5px; scrollbar-width:none; }
.sy-gallery-thumbs::-webkit-scrollbar { display:none; }
.sy-gallery-thumbs button { flex:0 0 64px; height:70px; border:1px solid rgba(255,255,255,.07); background:#0a0a0a; padding:3px; }
.sy-gallery-thumbs button.active { border-color:rgba(224,183,101,.70); box-shadow:0 0 18px rgba(224,183,101,.08); }
.sy-gallery-thumbs img { width:100%; height:100%; object-fit:cover; }
.sy-gallery-meta { text-align:center; margin-top:10px; display:flex; flex-direction:column; gap:4px; }
.sy-gallery-meta span { font-size:8px; letter-spacing:.20em; color:#d8c398; }
.sy-gallery-meta small { font-size:6px; letter-spacing:.18em; color:#686158; }
.sy-hero-desktop-picker { margin-top:25px; }
.sy-mobile-variant-picker { position:relative; z-index:9; }

/* search graph */
.sy-search-stage { position:relative; }
.sy-signal-graph { position:absolute; width:86%; left:7%; bottom:5%; height:70px; opacity:.42; pointer-events:none; z-index:2; }
.sy-signal-graph svg { width:100%; height:100%; overflow:visible; }
.sy-graph-grid { fill:none; stroke:rgba(218,174,90,.12); stroke-width:1; }
.sy-graph-line { fill:none; stroke:#d9ad5d; stroke-width:2; filter:drop-shadow(0 0 6px rgba(217,173,93,.55)); stroke-dasharray:1000; stroke-dashoffset:1000; animation:syGraphDraw 3s linear infinite; }
@keyframes syGraphDraw { to { stroke-dashoffset:0; } }
.sy-search-log>div.current { position:relative; overflow:hidden; }
.sy-search-log>div.current::after { content:""; position:absolute; left:0; top:0; width:35%; height:100%; background:linear-gradient(90deg,transparent,rgba(223,181,100,.08),transparent); animation:syLogScan 1.6s linear infinite; }
@keyframes syLogScan { from{transform:translateX(-130%)} to{transform:translateX(400%)} }

/* premium address */
.address-container { position:relative; }
.address-header { max-width:820px; }
.address-form { border:1px solid rgba(216,173,99,.14); background:linear-gradient(145deg,rgba(16,16,15,.88),rgba(7,7,7,.92)); padding:clamp(18px,3vw,34px); box-shadow:0 30px 90px rgba(0,0,0,.35); }
.address-form label { position:relative; }
.address-form label span { display:flex; align-items:center; gap:7px; }
.address-form label span::before { content:""; width:4px; height:4px; border-radius:50%; background:#d9ad5d; box-shadow:0 0 8px rgba(217,173,93,.35); }
.address-form input,.address-form textarea,.address-form select { background:linear-gradient(180deg,#10100f,#0a0a09); border:1px solid rgba(255,255,255,.08); color:#eee7dc; box-shadow:inset 0 0 25px rgba(0,0,0,.35); transition:border-color .2s,box-shadow .2s,transform .2s; }
.address-form input:focus,.address-form textarea:focus,.address-form select:focus { border-color:rgba(220,178,98,.62); outline:none; box-shadow:0 0 0 3px rgba(220,178,98,.05),inset 0 0 25px rgba(0,0,0,.35); transform:translateY(-1px); }
.sy-secure-notice { display:flex !important; align-items:center; gap:13px; }
.sy-secure-notice>span { width:34px; height:34px; border:1px solid rgba(220,178,98,.32); display:grid; place-items:center; border-radius:50%; color:#e1b76c; }
.sy-secure-notice div { display:flex; flex-direction:column; gap:4px; }
.sy-secure-notice strong { font-size:8px; letter-spacing:.17em; color:#dcb46c; }
.sy-secure-notice small { font-size:8px; color:#716b63; line-height:1.5; }

/* secure edition / payment */
.payment-container,.submitted-container,.success-container { position:relative; z-index:3; }
.payment-product { border:1px solid rgba(216,173,99,.14); background:linear-gradient(145deg,#0d0d0c,#070707); padding:18px; }
.payment-image { min-height:420px; display:grid; place-items:center; position:relative; }
.payment-image::after { content:""; position:absolute; width:70%; height:55%; background:radial-gradient(circle,rgba(221,176,89,.15),transparent 68%); filter:blur(28px); }
.payment-image img { position:relative; z-index:2; }
.payment-product-info h2 { letter-spacing:.08em; }
.sy-payment-selected { display:flex; align-items:center; gap:10px; margin:14px 0; padding:10px 11px; border:1px solid rgba(216,173,99,.13); background:#090909; }
.sy-payment-selected>div { display:flex; flex-direction:column; gap:3px; }
.sy-payment-selected small { color:#6d675e; font-size:6px; letter-spacing:.18em; }
.sy-payment-selected strong { color:#d9bc82; font-size:8px; letter-spacing:.10em; }
.qr-shell { background:#080808; border:1px solid rgba(216,173,99,.18); }

/* received */
.sy-premium-screen { min-height:100svh; background:#050505; overflow:hidden; position:relative; }
.sy-premium-screen-bg { position:absolute; inset:0; background:radial-gradient(circle at 50% 35%,rgba(217,173,92,.11),transparent 25%),linear-gradient(180deg,#080807,#030303); }
.sy-premium-screen::before { content:""; position:absolute; inset:18px; border:1px solid rgba(216,173,99,.10); pointer-events:none; }
.sy-premium-topbar { position:absolute; top:24px; left:28px; right:28px; display:flex; justify-content:space-between; color:#686159; font-size:7px; letter-spacing:.18em; z-index:5; }
.sy-premium-center { padding:100px 20px 50px; max-width:650px; }
.sy-success-symbol { width:52px; height:52px; border:1px solid rgba(221,178,96,.55); border-radius:50%; display:grid; place-items:center; color:#e1bb73; margin:0 auto 20px; box-shadow:0 0 35px rgba(221,178,96,.08); }
.sy-premium-center h1 { text-align:center; font-size:clamp(34px,8vw,62px); line-height:.92; letter-spacing:-.045em; margin:18px 0; }
.sy-premium-center h1 em { font-style:normal; color:#d9b66f; }
.sy-premium-center>p { max-width:460px; margin:0 auto; text-align:center; color:#777067; font-size:11px; line-height:1.75; }
.sy-received-product { height:320px; position:relative; display:grid; place-items:center; margin:12px auto -3px; }
.sy-received-ring { position:absolute; width:245px; height:245px; border:1px solid rgba(219,175,94,.26); border-radius:50%; box-shadow:0 0 60px rgba(219,175,94,.07),inset 0 0 35px rgba(219,175,94,.025); }
.sy-received-product img { height:285px; max-width:86%; object-fit:contain; position:relative; z-index:2; filter:drop-shadow(0 28px 25px rgba(0,0,0,.9)); }
.sy-received-card { display:grid; grid-template-columns:repeat(4,1fr); border:1px solid rgba(216,173,99,.18); background:rgba(9,9,8,.82); }
.sy-received-card>div { padding:13px 10px; border-right:1px solid rgba(255,255,255,.05); display:flex; flex-direction:column; gap:6px; min-width:0; }
.sy-received-card>div:last-child { border-right:0; }
.sy-received-card span { font-size:6px; color:#6f675d; letter-spacing:.17em; }
.sy-received-card strong { font-size:8px; color:#d9bf88; letter-spacing:.06em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.sy-premium-action { width:100%; margin-top:14px; min-height:54px; }

@media(max-width:850px){
  .sy-gallery-stage { min-height:380px; height:56vw; max-height:430px; }
  .sy-gallery-main-image { width:90%; height:94%; }
  .sy-gallery-arch { width:78%; height:92%; }
  .sy-gallery-floor { width:84%; }
  .sy-gallery-arrow { width:36px; height:36px; font-size:22px; }
  .sy-gallery-arrow-left { left:1%; } .sy-gallery-arrow-right { right:1%; }
  .sy-gallery-thumbs { margin-top:11px; }
  .sy-gallery-thumbs button { flex-basis:58px; height:62px; }
  .sy-signal-graph { width:92%; left:4%; bottom:1%; height:60px; }
  .payment-image { min-height:330px; }
  .sy-received-product { height:285px; }
  .sy-received-product img { height:250px; }
  .sy-received-ring { width:210px; height:210px; }
  .sy-received-card { grid-template-columns:1fr 1fr; }
  .sy-received-card>div:nth-child(2){border-right:0;}
  .sy-received-card>div:nth-child(3){border-top:1px solid rgba(255,255,255,.05);}
  .sy-received-card>div:nth-child(4){border-top:1px solid rgba(255,255,255,.05);border-right:0;}
}
@media(max-width:480px){
  .sy-gallery-stage { min-height:355px; height:390px; }
  .sy-gallery-main-image { width:94%; height:95%; }
  .sy-gallery-arch { width:84%; }
  .sy-gallery-controls { margin-top:1px; }
  .sy-gallery-meta span { font-size:7px; }
  .sy-gallery-meta small { font-size:5.5px; }
  .sy-premium-topbar { left:20px; right:20px; top:20px; }
  .sy-premium-center { padding-top:92px; }
  .sy-premium-center h1 { font-size:38px; }
  .sy-premium-center>p { font-size:9px; }
}

.sy-search-final-card { margin-top:16px; padding:12px; border:1px solid rgba(221,178,96,.35); background:linear-gradient(135deg,rgba(221,178,96,.08),rgba(8,8,8,.9)); display:flex; align-items:center; gap:12px; animation:syFoundIn .5s ease both; }
@keyframes syFoundIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
.sy-search-final-image { width:72px; height:78px; border:1px solid rgba(221,178,96,.24); display:grid; place-items:center; background:#080808; overflow:hidden; }
.sy-search-final-image img { width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 8px 8px rgba(0,0,0,.8)); }
.sy-search-final-copy { display:flex; flex-direction:column; gap:5px; }
.sy-search-final-copy span { font-size:6px; color:#7c7160; letter-spacing:.2em; }
.sy-search-final-copy strong { font-size:13px; letter-spacing:.08em; color:#e3c17c; }
.sy-search-final-copy p { margin:0; color:#81796e; font-size:7px; letter-spacing:.12em; }
.sy-success-product { height:300px; position:relative; display:grid; place-items:center; margin:10px auto 0; }
.sy-success-product-ring { position:absolute; width:210px; height:210px; border-radius:50%; border:1px solid rgba(219,175,94,.22); box-shadow:0 0 55px rgba(219,175,94,.07); }
.sy-success-product img { height:265px; max-width:88%; object-fit:contain; position:relative; z-index:2; filter:drop-shadow(0 25px 20px rgba(0,0,0,.9)); }
.sy-success-product>span { position:absolute; bottom:2px; z-index:4; padding:8px 12px; border:1px solid rgba(216,173,99,.15); background:rgba(5,5,5,.78); color:#cdb37e; font-size:7px; letter-spacing:.14em; }
@media(max-width:480px){ .sy-search-final-card{padding:9px}.sy-search-final-image{width:60px;height:66px}.sy-search-final-copy strong{font-size:11px}.sy-success-product{height:260px}.sy-success-product img{height:230px}.sy-success-product-ring{width:185px;height:185px} }

/* =========================================================
   V6 MOBILE COMPOSITION FIX
   The previous V5 showed both desktop and mobile finish pickers,
   and the gallery controls/thumbs could collide with the product.
   V6 makes one clean mobile flow: finish -> gallery -> price -> CTA.
   ========================================================= */
.sy-mobile-variant-picker { display:none; }
.sy-gallery { width:100%; }
.sy-gallery-stage { overflow:hidden; }
.sy-gallery-main-image { object-position:center center; }

@media (max-width:850px) {
  /* Only one finish selector on mobile. */
  .sy-hero-desktop-picker { display:none !important; }
  .sy-mobile-variant-picker {
    display:block !important;
    order:2;
    width:min(100%,360px);
    margin:20px auto 0;
  }
  .sy-hero-product { order:3; width:100%; height:auto; min-height:0; margin-top:4px; }
  .sy-mobile-buy { order:4; }
  .sy-hero-copy { order:1; }

  /* Compact product stage: bottle stays dominant without swallowing the controls. */
  .sy-gallery-stage {
    height:350px !important;
    min-height:350px !important;
    max-height:350px !important;
    margin-top:0;
    overflow:hidden;
  }
  .sy-gallery-main-image {
    width:100% !important;
    height:330px !important;
    max-height:330px !important;
    object-fit:contain !important;
    transform:none !important;
  }
  .sy-gallery-glow { width:82%; height:82%; }
  .sy-gallery-arch { width:82%; height:90%; top:1%; }
  .sy-gallery-floor { width:76%; bottom:2%; }

  /* Side arrows sit beside the product, not over the lower controls. */
  .sy-gallery-arrow {
    width:34px !important;
    height:34px !important;
    font-size:21px !important;
    top:50% !important;
    transform:translateY(-50%);
  }
  .sy-gallery-arrow-left { left:5px !important; }
  .sy-gallery-arrow-right { right:5px !important; }

  .sy-gallery-controls {
    height:38px;
    margin:5px auto 0 !important;
    gap:14px;
  }
  .sy-gallery-controls>button { width:30px; height:30px; }
  .sy-gallery-dots { gap:6px; }
  .sy-gallery-dots button.active { width:20px; }

  /* Four image options remain available but are now below the controls. */
  .sy-gallery-thumbs {
    width:100%;
    max-width:360px;
    justify-content:flex-start;
    gap:7px;
    margin:7px auto 0 !important;
    padding:2px 2px 4px;
    overflow-x:auto;
    -webkit-overflow-scrolling:touch;
  }
  .sy-gallery-thumbs button {
    flex:0 0 58px !important;
    width:58px;
    height:58px !important;
  }
  .sy-gallery-meta { margin-top:7px !important; }

  /* Keep the mobile price clearly BELOW the gallery. */
  .sy-mobile-buy {
    width:min(100%,360px);
    margin:12px auto 0 !important;
  }
  .sy-mobile-price { margin:4px 0 14px !important; }
  .sy-mobile-buy .sy-main-cta { width:100%; max-width:none; }
}

@media (max-width:480px) {
  .sy-hero-content { width:calc(100% - 24px) !important; padding-top:20px !important; }
  .sy-mobile-variant-picker { width:100% !important; margin-top:16px !important; }
  .sy-variant-picker-head { margin-bottom:8px; }
  .sy-variant-options { gap:6px !important; }
  .sy-mobile-variant-picker .sy-variant-card {
    min-height:56px !important;
    padding:7px 8px !important;
  }
  .sy-gallery-stage {
    height:340px !important;
    min-height:340px !important;
    max-height:340px !important;
  }
  .sy-gallery-main-image {
    height:320px !important;
    max-height:320px !important;
    width:100% !important;
  }
  .sy-gallery-arch { width:84%; height:88%; }
  .sy-gallery-arrow { width:32px !important; height:32px !important; }
  .sy-gallery-thumbs { max-width:100%; }
  .sy-gallery-thumbs button { flex-basis:55px !important; width:55px; height:55px !important; }
  .sy-gallery-meta small { font-size:5.5px; }
}

/* Desktop: keep the gallery large and the selector beside the product. */
@media (min-width:851px) {
  .sy-mobile-variant-picker { display:none !important; }
  .sy-hero-product { min-height:620px; }
}

`;