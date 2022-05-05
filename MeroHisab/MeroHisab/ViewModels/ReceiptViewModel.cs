using MeroHisab.Core.Dto;
using MeroHisab.Core.Exceptions;
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
	public class ReceiptViewModel : ViewModelBase
	{
		public IAsyncCommand SaveButtonClickedCommand { get; set; }
		public IAsyncCommand CancelButtonClickedCommand { get; set; }

        private readonly IReceiptService _receiptService;
		private readonly INotificationService _notificationService;
        private readonly IAccountHeadService _accountHeadService;
		public Page page;

		public ReceiptViewModel(IReceiptService receiptService, INotificationService notificationService, IAccountHeadService accountHeadService)
		{
            _accountHeadService = accountHeadService;
			SaveButtonClickedCommand = new AsyncCommand(Proceed);
			CancelButtonClickedCommand = new AsyncCommand(Cancel, () => true);
            _receiptService = receiptService;
			_notificationService = notificationService;
            Ledgers = new ObservableRangeCollection<GenericDropDownDto<int, string>>();
            PaymentReceiptTo = new ObservableRangeCollection<GenericDropDownDto<int, string>>();
		}
        public DateTime MaxDate { get; set; } = DateTime.Now;
		public ReceiptDto Model
        {
            get => GetValue<ReceiptDto>();
            set => SetValue(value);
        }
        private async Task Proceed()
        {
            try
            {
                if (!ValidationHelper.IsFormValid(Model, page))
                    return;
                Model.ReceiptFrom = LedgerList.Value;
                Model.ReceiptTo = LedgerList.Value;
                await _receiptService.MakeReceipt(Model);
                await _notificationService.ShowInfo("Success", "Operation performed successfully.");
                await _navigationService.HideModal();
                string key = "ReceiptSave";
                MessagingCenter.Send(Model, key);
            }
            catch (ItemNotFoundException ex)
			{
                await _notificationService.ShowInfo("Error", ex.Message);
            }
            catch (InvalidValueException ex)
			{
                await _notificationService.ShowInfo("Error", ex.Message);
            }
            catch (Exception ex)
            {
                await _notificationService.ShowInfo("Error", "Failed to perform specified operation");
            }

        }
        public ObservableRangeCollection<GenericDropDownDto<int, string>> Ledgers
        {
            get => GetValue<ObservableRangeCollection<GenericDropDownDto<int, string>>>();
            set
            {
                SetValue(value);
            }
        }

        public ObservableRangeCollection<GenericDropDownDto<int, string>> PaymentReceiptTo
        {
            get => GetValue<ObservableRangeCollection<GenericDropDownDto<int, string>>>();
            set
            {
                SetValue(value);
            }
        }

        public GenericDropDownDto<int, string> LedgerList
        {
            get => GetValue<GenericDropDownDto<int, string>>();
            set
            {
                SetValue(value);
            }
        }
        public GenericDropDownDto<int, string> PaymentReceiptToLedgerList
        {
            get => GetValue<GenericDropDownDto<int, string>>();
            set
            {
                SetValue(value);
            }
        }

        private async Task Cancel()
        {
            await _navigationService.HideModal();
        }
        public async Task SetValues(ReceiptDto dto)
        {
            dto.TransactionDate=DateTime.Now;
            Model = dto;
            var accountHeads = await _accountHeadService.GetAllAcountHead();
            var paymentMediums = await _accountHeadService.GetAccountHeads(Core.Enums.LedgerType.PaymentMedium);
            var accountHead = accountHeads.Select(a => new GenericDropDownDto<int, string>
            {
                Text = a.Name,
                Value = a.Id,
            }).ToList();
            var paymentMedium = paymentMediums.Select(a => new GenericDropDownDto<int, string>
            {
                Text=a.Name,
                Value=a.Id,
            }).ToList();

            Ledgers.Clear();
            Ledgers.AddRange(accountHead);
            PaymentReceiptTo.AddRange(paymentMedium);
            LedgerList = Ledgers.FirstOrDefault(a => a.Value == (int)dto.ReceiptFrom);
            PaymentReceiptToLedgerList = PaymentReceiptTo.FirstOrDefault(a => a.Value == (int)dto.ReceiptTo);
            //PaymentMediumList = new GenericDropDownDto<int, string>();
        }
    }
}
