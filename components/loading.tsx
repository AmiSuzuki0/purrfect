import { Rammetto_One } from "next/font/google";
const RammettoOne = Rammetto_One({ subsets: ["latin"], weight: ["400"] });

const Loading = () => {
    return(
        <div className="fixed top-0 left-0 w-screen h-screen bg-zinc-950/20 grid justify-center items-center">
            <div className="flex justify-center items-center gap-6">
                <div className="h-10 w-10 animate-spin border-[5px] rounded-full border-t-transparent"></div>
                <p className="text-3xl font-weight"><span className={RammettoOne.className}>Loading</span></p>
            </div>
        </div>
    )
}

export default Loading