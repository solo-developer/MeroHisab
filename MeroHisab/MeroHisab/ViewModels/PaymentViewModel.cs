using MeroHisab.Core.Dto;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Helpers.Implementations;
using MeroHisab.Helpers.Interface;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MeroHisab.ViewModels
{
	public class PaymentViewModel : ViewModelBase
	{
		public IAsyncCommand SaveButtonClickedCommand { get; set; }
		public IAsyncCommand CancelButtonClickedCommand { get; set; }

		private readonly IPaymentService _paymentService;
		private readonly INotificationService _notificationService;
		public Page page;

		public PaymentViewModel(IPaymentService paymentService, INotificationService notificationService)
		{
			SaveButtonClickedCommand = new AsyncCommand(Proceed);
			CancelButtonClickedCommand = new AsyncCommand(Cancel, () => true);
			_paymentService = paymentService;
			_notificationService = notificationService;
		}

		private async Task Cancel()
		{
			await _navigationService.HideModal();
		}
		public PaymentDto Model
		{
			get => GetValue<PaymentDto>();
			set => SetValue(value);
		}
		private async Task Proceed()
		{
			try
			{
				if (!ValidationHelper.IsFormValid(Model, page))
					return;

				await _paymentService.DoPayment(Model);
				await _notificationService.ShowInfo("Success", "Operation performed successfully.");
				await _navigationService.HideModal();
				string key = "PaymentSave";
				MessagingCenter.Send(Model, key);
			}
			catch (Exception ex)
			{
				await _notificationService.ShowInfo("Error", "Failed to perform specified operation");
			}
		}
		public void SetValues(PaymentDto dto)
		{
			Model = dto;
		}
	}
}
