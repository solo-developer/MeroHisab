using MeroHisab.Core.Dto;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Helpers.Interface;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MeroHisab.ViewModels.DefaultAccountSetup
{
    public class TransactionFilterViewModel
    {
        public DateTime FromDate { get; set; } = DateTime.Now.AddDays(-7);
        public DateTime ToDate { get; set; } = DateTime.Now;
        public int? LedgerId { get; set; }
    }

    public class TransactionFilterPageModel : ViewModelBase
    {
        private readonly ILedgerService _ledgerService;
        private readonly INotificationService _notificationService;

       
        public IAsyncCommand ApplyFilterButtonClicked { get; set; }
        public TransactionFilterPageModel(ILedgerService ledgerService, INotificationService notificationService)
        {
            Filter = new TransactionFilterViewModel();
            _ledgerService = ledgerService;
            _notificationService = notificationService;
            Ledgers = new ObservableRangeCollection<LedgerDto>();
            ApplyFilterButtonClicked = new AsyncCommand(OnApplyFilterButtonClicked);
            GetLedgers();
        }

        private async Task OnApplyFilterButtonClicked()
        {
            string key = "TransactionFilterPopuPage.ApplyFilterButtonPressed";
            MessagingCenter.Send(Filter, key);
            await _navigationService.HideModal();
        }

        public LedgerDto SelectedLedger
        {
            get=> GetValue<LedgerDto>();
            set=> SetValue(value);
        }
        public ObservableRangeCollection<LedgerDto> Ledgers
        {
            get => GetValue<ObservableRangeCollection<LedgerDto>>();
            set => SetValue(value);
        }
        public TransactionFilterViewModel Filter
        {
            get => GetValue<TransactionFilterViewModel>();
            set => SetValue(value);
        }
        public void SetValues(TransactionFilterViewModel viewModel)
        {
            this.Filter.LedgerId = viewModel.LedgerId;
            this.Filter.FromDate = viewModel.FromDate;
            this.Filter.ToDate = viewModel.ToDate;
        }
        private async Task GetLedgers()
        {
            try
            {
                var ledgers = await _ledgerService.GetAllLedgersAsync();
                Ledgers.Clear();
                Ledgers.AddRange(ledgers);

                if (this.Filter.LedgerId.HasValue)
                {
                    SelectedLedger = ledgers.Where(a => a.LedgerId == this.Filter.LedgerId.Value).SingleOrDefault();
                }
            }
            catch (Exception ex)
            {
                await _notificationService.ShowInfo("Error!!", "Failed to get account heads");
            }
        }
    }
}
