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
	public class ReceiptViewModel : ViewModelBase
	{
		public IAsyncCommand SaveButtonClickedCommand { get; set; }
		public IAsyncCommand CancelButtonClickedCommand { get; set; }

        private readonly IReceiptService _receiptService;
		private readonly INotificationService _notificationService;
		public Page page;

		public ReceiptViewModel(IReceiptService receiptService, INotificationService notificationService)
		{
			SaveButtonClickedCommand = new AsyncCommand(Proceed);
			CancelButtonClickedCommand = new AsyncCommand(Cancel, () => true);
            _receiptService = receiptService;
			_notificationService = notificationService;
		}

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

                await _receiptService.MakeReceipt(Model);
                await _notificationService.ShowInfo("Success", "Operation performed successfully.");
                await _navigationService.HideModal();
                string key = "ReceiptSave";
                MessagingCenter.Send(Model, key);
            }
            catch (Exception ex)
            {
                await _notificationService.ShowInfo("Error", "Failed to perform specified operation");
            }

        }

        private async Task Cancel()
        {
            await _navigationService.HideModal();
        }
        public void SetValues(ReceiptDto dto)
        {
            Model = dto;
        }
    }
}
