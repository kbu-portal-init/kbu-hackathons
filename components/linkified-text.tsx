type LinkifiedTextProps = {
    text: string;
};

const URL_REGEX = /https?:\/\/[^\s]+/;

export function LinkifiedText({ text }: LinkifiedTextProps) {
    const parts = text.split(/(https?:\/\/[^\s]+)/);
    return (
        <>
            {parts.map((part) =>
                URL_REGEX.test(part) ? (
                    <a
                        key={part}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-4 break-all"
                    >
                        {part}
                    </a>
                ) : (
                    part
                ),
            )}
        </>
    );
}
