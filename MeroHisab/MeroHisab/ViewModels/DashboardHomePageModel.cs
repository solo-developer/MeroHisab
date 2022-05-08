using MeroHisab.Core.Dto;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Models;
using MeroHisab.Partial.Journal;
using MeroHisab.Partial.Payment;
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
        public DashboardHomePageModel(IReceiptService receiptService)
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
                    await AddReceipt(new ReceiptDto());
                    break;
                case "Payment":
                    await AddPayment(new PaymentDto());
                    break;
                case "Journal":
                    await AddJournal(new JournalDto());
                    break;
                case "Transfer":
                    await AddPayment(new PaymentDto());
                    break;
            }
        }
        private async Task AddReceipt(ReceiptDto dto)
        {
            await _navigationService.ShowModal(new AddReceiptModal(dto));
            MessagingCenter.Subscribe<ReceiptDto>(this, "AddReceipt", AfterManipulatingReceiptModal);
        }

		private void AfterManipulatingReceiptModal(ReceiptDto obj)
		{

        }

		private async Task AddPayment(PaymentDto dto)
		{
            await _navigationService.ShowModal(new AddPaymentModal(dto));
            MessagingCenter.Subscribe<PaymentDto>(this, "AddPayment", AfterManipulatingPaymentModal);
        }
        private void AfterManipulatingPaymentModal(PaymentDto obj)
        {

        }
        private async Task AddJournal(JournalDto dto)
        {
            await _navigationService.ShowModal(new AddJournalModal(dto));
            MessagingCenter.Subscribe<JournalDto>(this, "AddJournal", AfterManipulatingJournalModal);
        }
        private void AfterManipulatingJournalModal(JournalDto obj)
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
