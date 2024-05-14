import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Cards from "../components/Cards";
import TransactionForm from "../components/TransactionForm";
import { MdLogout } from "react-icons/md";
import { GET_TRANSACTION_STATISTICS } from "../graphql/queries/transaction.query";
import { toast } from "react-hot-toast";
import { useMutation, useQuery } from "@apollo/client";
import { LOGOUT } from "../graphql/mutations/user.mutation";
import { useEffect, useState } from "react";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.query";


// const HomePage = () => {
// 	const chartData = {
// 		labels: ["Saving", "Expense", "Investment"],
// 		datasets: [
// 			{
// 				label: "%",
// 				data: [18, 14, 10],
// 				backgroundColor: ["rgba(251, 191, 36)", "rgba(104, 66, 246)", "rgba(38, 166, 154)"],
// 				borderColor: ["rgba(251, 191, 36)", "rgba(104, 66, 246)", "rgba(38, 166, 154)"],
// 				borderWidth: 6,
// 				borderRadius: 30,
// 				spacing: 15,
// 				cutout: 135,
// 			},
// 		],
// 	};


ChartJS.register(ArcElement, Tooltip, Legend);

const HomePage = () => {

	const {data} = useQuery(GET_TRANSACTION_STATISTICS);
	const {data: authUserData} = useQuery(GET_AUTHENTICATED_USER);

	const [logout, {loading, client}] = useMutation(LOGOUT, {
		refetchQueries: ["GetAuthenticatedUser"],
	});

	const [chartData, setChartData] = useState({
		labels: ["Saving", "Expense", "Investment"],
		datasets: [
			{
				label: "$",
				data: [],
				backgroundColor: [],
				borderColor: [],
				borderWidth: 6,
				borderRadius: 30,
				spacing: 15,
				cutout: 135,
			},
		],
	});

    
	useEffect(() => {
		if (data?.categoryStatistics) {
			const categories = data.categoryStatistics.map((stat) => stat.category);
			const totalAmounts = data.categoryStatistics.map((stat) => stat.totalAmount);

			const backgroundColors = [];
			const borderColors = [];

			categories.forEach((category) => {
				if (category === "saving") {
					backgroundColors.push("rgba(251, 191, 36)");
					borderColors.push("rgba(251, 191, 36)");
				} else if (category === "expense") {
					backgroundColors.push("rgba(104, 66, 246)");
					borderColors.push("rgba(104, 66, 246)");
				} else if (category === "investment") {
					backgroundColors.push("rgba(38, 166, 154)");
					borderColors.push("rgba(38, 166, 154)");
				}
			});

			setChartData((prev) => ({
				labels: categories,
				datasets: [
					{
						...prev.datasets[0],
						data: totalAmounts,
						backgroundColor: backgroundColors,
						borderColor: borderColors,
					},
				],
			}));
		}
	}, [data]);

	const handleLogout = async () => {
		try{
           await logout()
		client.resetStore()
		}
		catch(error){
			console.error("Error logging out:", error);
			toast.error(error.message)
		}
	};


	return (
		<>
			<div className='flex flex-col gap-6 items-center max-w-7xl mx-auto z-20 relative justify-center'>
				<div className='flex items-center'>
					<p className='md:text-4xl text-2xl lg:text-4xl font-bold text-center relative z-50 mb-4 mr-4 bg-gradient-to-r from-teal-600 via-green-500 to-teal-400 inline-block text-transparent bg-clip-text'>
					Smart Spending, Smart Savings
					</p>
					<img
						src={authUserData?.authUser.profilePicture}
						className='w-11 h-11 rounded-full border cursor-pointer'
						alt='Avatar'
					/>
					{!loading && <MdLogout className='mx-2 w-5 h-5 cursor-pointer' onClick={handleLogout} />}
					{/* loading spinner */}
					{loading && <div className='w-6 h-6 border-t-2 border-b-2 mx-2 rounded-full animate-spin'></div>}
				</div>
				<div className='flex flex-wrap w-full justify-center items-center gap-6'>

					{data?.categoryStatistics.length > 0 && (
					<div className='h-[330px] w-[330px] md:h-[360px] md:w-[360px]  '>
						<Doughnut data={chartData} />
					</div>
					)}

					<TransactionForm />
				</div>
				<Cards />
			</div>
		</>
	);
};
export default HomePage;