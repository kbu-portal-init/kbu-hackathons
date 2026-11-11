type LinkifiedTextProps = {
    text: string;
};

function trimTrailingPunctuation(url: string): { href: string; trailing: string } {
    let href = url;
    let trailing = "";
    while (/[.,;:!?)]$/.test(href)) {
        const last = href.slice(-1);
        if (last === ")") {
            const opens = (href.match(/\(/g) ?? []).length;
            const closes = (href.match(/\)/g) ?? []).length;
            if (closes <= opens) break;
        }
        trailing = last + trailing;
        href = href.slice(0, -1);
    }
    return { href, trailing };
}

export function LinkifiedText({ text }: LinkifiedTextProps) {
    const parts = text.split(/(https?:\/\/\S+)/);
    return (
        <>
            {parts.map((part, index) => {
                if (!/^https?:\/\//.test(part)) return part;
                const { href, trailing } = trimTrailingPunctuation(part);
                return (
                    // biome-ignore lint/suspicious/noArrayIndexKey: position-stable occurrence key
                    <span key={`${index}-${href}`}>
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline underline-offset-4 break-all"
                        >
                            {href}
                        </a>
                        {trailing}
                    </span>
                );
            })}
        </>
    );
}
