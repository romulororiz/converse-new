'use client';

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { BookCoverImage } from '@/components/BookCoverImage';

interface ShareCardProps {
	bookTitle: string;
	bookAuthor?: string | null;
	bookCover?: string | null;
	quote: string;
}

const MAX_CHARS = 400;

export function ShareCard({
	bookTitle,
	bookAuthor,
	bookCover,
	quote,
}: ShareCardProps) {
	const [expanded, setExpanded] = useState(false);
	const [copied, setCopied] = useState(false);
	const isLong = quote.length > MAX_CHARS;
	const displayQuote =
		expanded || !isLong ? quote : quote.slice(0, MAX_CHARS) + '...';

	const handleCopy = () => {
		navigator.clipboard.writeText(
			`"${quote}" — ${bookTitle}${bookAuthor ? `, ${bookAuthor}` : ''}\n\nvia Converse`,
		);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className='paper-card p-6 max-w-md mx-auto text-center'>
			<div className='flex justify-center mb-4'>
				<div className='w-14 h-20 rounded-[8px] overflow-hidden shadow-md'>
					<BookCoverImage src={bookCover} alt={bookTitle} variant='card' />
				</div>
			</div>

			<blockquote
				className={`font-serif text-lg font-medium leading-relaxed mb-3 text-foreground/90 italic ${
					expanded && isLong
						? 'max-h-56 overflow-y-auto hide-scrollbar pr-1'
						: ''
				}`}
				style={
					expanded && isLong
						? { scrollbarWidth: 'none', msOverflowStyle: 'none' }
						: undefined
				}
			>
				&ldquo;{displayQuote}&rdquo;
			</blockquote>

			{isLong && (
				<button
					onClick={() => setExpanded(v => !v)}
					className='text-xs text-muted-foreground hover:text-foreground/70 inline-flex items-center gap-1 mb-3 cursor-pointer'
				>
					{expanded ? (
						<>
							<ChevronUp size={12} /> Show less
						</>
					) : (
						<>
							<ChevronDown size={12} /> Show full quote
						</>
					)}
				</button>
			)}

			<p className='text-sm font-semibold text-foreground'>{bookTitle}</p>
			{bookAuthor && (
				<p className='text-xs text-muted-foreground'>by {bookAuthor}</p>
			)}

			<div className='mt-4 pt-3 border-t border-border flex items-center justify-center gap-3'>
				<span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
					<Sparkles size={10} /> Converse
				</span>
				<button
					onClick={handleCopy}
					className='text-xs text-muted-foreground hover:text-foreground/80 inline-flex items-center gap-1 cursor-pointer'
				>
					{copied ? (
						<>
							<Check size={11} /> Copied
						</>
					) : (
						<>
							<Copy size={11} /> Copy
						</>
					)}
				</button>
			</div>
		</div>
	);
}
