const yellowText = ({children, ...props}: any) => {
    return (
        <>
            <p className="bg-[#ff8b1a] p-[.2rem]  rounded-[.3rem]" {...props}>{children}</p>
        </>
    )
}

const blueText = ({children, ...props}: any) => {
    return (
        <>
            <p className="bg-[#4287f5] p-[.2rem]  rounded-[.3rem]" {...props}>{children}</p>
        </>
    )
}

export default Object.freeze({
    yellowText,
    blueText,
})