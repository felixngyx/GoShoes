import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../../../apis/axiosClient';
import LoadingIcon from '../../../components/common/LoadingIcon';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const VerifyEmail = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get('token');
	const [isLoading, setIsLoading] = useState(false);
	const [status, setStatus] = useState(true);
	const navigate = useNavigate();

	const requestSendEmail = async () => {
		try {
			toast.info('Sending email...');
			new Promise((resolve) => setTimeout(resolve, 2000));
			await axiosClient.post('/auth/send-verify-email');
			document.querySelector('.info-verify-email')!.textContent =
				'Email sent successfully.';
			toast.success('Email sent successfully.');
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		const access_token = Cookies.get('access_token');
		if (!access_token) {
			navigate('/signin');
			toast.error('Please login to continue');
			return;
		} else {
			(async () => {
				try {
					setIsLoading(true);
					const res = await axiosClient.post('/auth/register-verify', {
						token,
					});
					if (res.status === 200) setStatus(true);
				} catch (error: any) {
					if (error?.response?.status === 400) setStatus(false);
					console.log(error);
				} finally {
					setIsLoading(false);
				}
			})();
		}
	}, [token]);

	return (
		<>
			{isLoading ? (
				<div className="flex justify-center items-center min-h-[600px]">
					<LoadingIcon type="spinner" size="lg" color="primary" />
				</div>
			) : (
				<div className="flex justify-center items-center min-h-[600px]">
					<span className="text-center">
						<h1 className="text-4xl mb-5">Verify Email</h1>
						{status ? (
							<p className="info-verify-email text-xl font-extralight text-green-500">
								Your email has been verified successfully.
							</p>
						) : (
							<p className="info-verify-email text-xl font-extralight text-red-500">
								Your session has expired, please resend email
							</p>
						)}
						{status ? (
							<Link
								to="/"
								className="btn btn-outline bg-[#4182F9] text-white mt-10"
							>
								Back to home page
							</Link>
						) : (
							<button
								className="btn btn-outline bg-[#4182F9] text-white mt-10"
								onClick={() => requestSendEmail()}
							>
								Resend email
							</button>
						)}
					</span>
				</div>
			)}
		</>
	);
};

export default VerifyEmail;
