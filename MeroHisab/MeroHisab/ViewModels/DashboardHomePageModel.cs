using MeroHisab.Core.Dto;
using MeroHisab.Models;
using MeroHisab.Partial.Receipt;
using System;
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
                await AddReceipt(new ReceiptDto());
            MessagingCenter.Send(this, key);
            return;
        }
        private async Task AddReceipt(ReceiptDto dto)
        {
            await _navigationService.ShowModal(new AddReceiptModal(dto));

            MessagingCenter.Subscribe<ReceiptDto>(this, "AccountHeadSavedUpdated", AfterManipulatingAccountHeads);
        }
        private async void AfterManipulatingAccountHeads(ReceiptDto obj)
        {

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
