'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const ReviewsSection = dynamic(() => import('./ReviewsSection'), {
  ssr: false,
});

type Props = {
  productId: string;
};

const ReviewsSectionWrapper = ({ productId }: Props) => {
  return <ReviewsSection productId={productId} />;
};

export default ReviewsSectionWrapper;
