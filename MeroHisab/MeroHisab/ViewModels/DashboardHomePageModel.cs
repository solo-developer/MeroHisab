using MeroHisab.Core.Services.Interface;
using MeroHisab.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MeroHisab.ViewModels
{
    public class DashboardHomePageModel : ViewModelBase
    {
        public IAsyncCommand SettingSelectedCommand { get; set; }

        public IAsyncCommand ReceiptSave { get; set; }
        public DashboardHomePageModel()
        {
            SettingSelectedCommand = new AsyncCommand(GetTabValue);
            Operations = new ObservableRangeCollection<GridItem>();
            this.SetAvailableOperations();
        }

		private async Task GetTabValue()
		{
            var s=SelectedItem;
            SelectedItem = null;
            string key = "ReceiptSave";
            if(s != null)
                await ModalType(s.DisplayName);
            MessagingCenter.Send(this, key);
            return;
        }
        private async Task ModalType(string selectedItem)
        {
            switch (selectedItem)
            {
                case "Receipt":
                    await AddReceipt();
                    break;
                case "Payment":
                    await AddPayment();
                    break;
                case "Journal":
                    await AddJournal();
                    break;
                case "Transfer":
                    await AddPayment();
                    break;
            }
        }
        private async Task AddReceipt()
        {
            await _navigationService.NavigateToAsync<AddReceiptViewModel>();
        }

		private async Task AddPayment()
		{
          await _navigationService.NavigateToAsync<AddPaymentViewModel>();           
        }

        private async Task AddJournal()
        {
            await _navigationService.NavigateToAsync<JournalViewModel>();
        }
        public GridItem SelectedItem
        {
            get => GetValue<GridItem>();
            set
            {
                SetValue(value);
            }
        }
        public ObservableRangeCollection<GridItem> Operations
        {
            get => GetValue<ObservableRangeCollection<GridItem>>();
            set => SetValue(value);
        }

        private void SetAvailableOperations()
        {
            List<GridItem> availableOperations = new List<GridItem>() {
            new GridItem() { DisplayName = "Payment", IconName = FontAwesome.FontAwesomeIcons.FileInvoice, NavigationViewModelType =null },
            new GridItem() { DisplayName = "Receipt", IconName = FontAwesome.FontAwesomeIcons.Receipt, NavigationViewModelType = null },
            new GridItem() { DisplayName = "Journal", IconName = FontAwesome.FontAwesomeIcons.NotesMedical, NavigationViewModelType = null },
            new GridItem() { DisplayName = "Transfer", IconName = FontAwesome.FontAwesomeIcons.Sync, NavigationViewModelType = null }

            };

            Operations.AddRange(availableOperations);
        }
    }  
}
