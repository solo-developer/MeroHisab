using MeroHisab.Core.Dto;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Helpers.Implementations;
using MeroHisab.Helpers.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MeroHisab.ViewModels
{
	public class AddPaymentViewModel : ViewModelBase
	{
		public IAsyncCommand SaveButtonClickedCommand { get; set; }
		public IAsyncCommand CancelButtonClickedCommand { get; set; }

		private readonly IPaymentService _paymentService;
		private readonly INotificationService _notificationService;
		private readonly IAccountHeadService _accountHeadService;
		public Page page;

		public AddPaymentViewModel(IPaymentService paymentService, INotificationService notificationService, IAccountHeadService accountHeadService)
		{
			_accountHeadService= accountHeadService;
			SaveButtonClickedCommand = new AsyncCommand(Proceed);
			CancelButtonClickedCommand = new AsyncCommand(Cancel, () => true);
			_paymentService = paymentService;
			_notificationService = notificationService;
			PaymentTo = new ObservableRangeCollection<GenericDropDownDto<int, string>>();
			PaymentFrom = new ObservableRangeCollection<GenericDropDownDto<int, string>>();
			Model = new AddPaymentDto();
			this.SetValues();
		}

		private async Task Cancel()
		{
            await _navigationService.MoveBack();
        }
		public AddPaymentDto Model
		{
			get => GetValue<AddPaymentDto>();
			set => SetValue(value);
		}
		private async Task Proceed()
		{
			try
			{
				if (!ValidationHelper.IsFormValid(Model, page))
					return;
				Model.PaymentTo = PaymentToList.Value;
				Model.PaymentFrom = PaymentFromList.Value;
				await _paymentService.DoPayment(Model);
				await _notificationService.ShowInfo("Success", "Operation performed successfully.");
				await _navigationService.MoveBack();
			}
			catch (Exception ex)
			{
				await _notificationService.ShowInfo("Error", "Failed to perform specified operation");
			}
		}
		public async Task SetValues()
		{
			var accountHeads = await _accountHeadService.GetAllAcountHead();
			var paymentMediums = await _accountHeadService.GetAccountHeads(Core.Enums.LedgerType.PaymentMedium);
			var accountHead = accountHeads.Select(a => new GenericDropDownDto<int, string>
			{
				Value = a.Id,
				Text = a.Name,
			}).ToList();
			var paymentMedium = paymentMediums.Select(a => new GenericDropDownDto<int, string>
			{
				Value = a.Id,
				Text = a.Name,
			}).ToList();
			PaymentFrom.Clear();
			PaymentFrom.AddRange(paymentMedium);
			PaymentTo.AddRange(accountHead);
			PaymentFromList = PaymentFrom.FirstOrDefault(a => a.Value == (int)Model.PaymentFrom);
			PaymentToList = PaymentTo.FirstOrDefault(a => a.Value == (int)Model.PaymentTo);
		}

		public ObservableRangeCollection<GenericDropDownDto<int, string>> PaymentFrom
		{
			get => GetValue<ObservableRangeCollection<GenericDropDownDto<int, string>>>();
			set
			{
				SetValue(value);
			}
		}

		public ObservableRangeCollection<GenericDropDownDto<int, string>> PaymentTo
		{
			get => GetValue<ObservableRangeCollection<GenericDropDownDto<int, string>>>();
			set
			{
				SetValue(value);
			}
		}

		public GenericDropDownDto<int, string> PaymentFromList
		{
			get => GetValue<GenericDropDownDto<int, string>>();
			set
			{
				SetValue(value);
			}
		}
		public GenericDropDownDto<int, string> PaymentToList
		{
			get => GetValue<GenericDropDownDto<int, string>>();
			set
			{
				SetValue(value);
			}
		}
	}
}
