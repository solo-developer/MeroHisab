using MeroHisab.Core.BaseRepository.Interface;
using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Repository.Interface;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Helpers.Interface;
using MeroHisab.Partial.AccountHead;
using MeroHisab.Services.Interface;
using System;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.CommunityToolkit.UI.Views;
using Xamarin.Forms;

namespace MeroHisab.ViewModels
{
    public class PaymentMediumListPageModel :ViewModelBase
    {
        private readonly IAccountHeadService _accountHeadService;
        private readonly IBaseRepository<Ledger> _accountHeadRepo;
        private readonly INotificationService _notificationService;

        public IAsyncCommand AddPaymentMediumCommand { get; set; }
        public ICommand OnEditButtonClicked { get; set; }
        public ICommand OnDeleteButtonClicked { get; set; }

        public PaymentMediumListPageModel(IAccountHeadService accountHeadService, IBaseRepository<Ledger> accountHeadRepo,INotificationService notificationService)
        {
            _accountHeadService = accountHeadService;
            _accountHeadRepo = accountHeadRepo;
            PaymentMediums = new ObservableRangeCollection<AccountHeadDto>();
            AddPaymentMediumCommand = new AsyncCommand(() => OpenAccountHeadModal(new AccountHeadDto() { LedgerType = Core.Enums.LedgerType.PaymentMedium,HeadType= Core.Enums.LedgerGroupType.Income }), a => true);
            OnEditButtonClicked = new Command<int>(async (id) => await EditDetail(id), a => true);
            OnDeleteButtonClicked = new Command<int>(async (id) => await Disable(id), a => true);
            _notificationService=notificationService;   
            LoadAllPaymentMediums();
        }

        public LayoutState PaymentMediumDataState
        {
            get => GetValue<LayoutState>();
            set
            {
                SetValue(value);
            }
        }

        public ObservableRangeCollection<AccountHeadDto> PaymentMediums
        {
            get => GetValue<ObservableRangeCollection<AccountHeadDto>>();
            set
            {
                SetValue(value);
            }
        }

        private async Task LoadAllPaymentMediums()
        {
            try
            {
                PaymentMediumDataState = LayoutState.Loading;
                PaymentMediums = new ObservableRangeCollection<AccountHeadDto>();
                var heads = await _accountHeadService.GetAccountHeads(Core.Enums.LedgerType.PaymentMedium);
                PaymentMediums.AddRange(heads);

                PaymentMediumDataState = LayoutState.Success;
            }
            catch (System.Exception)
            {
                PaymentMediumDataState = LayoutState.Error;
            }
        }

        private async Task OpenAccountHeadModal(AccountHeadDto dto)
        {
            await _navigationService.ShowModal(new AddEditAccountHeadModal(dto));

            MessagingCenter.Subscribe<AccountHeadDto>(this, "PaymentMediumSavedUpdated", AfterManipulatingPaymentMediums);
        }

        private async void AfterManipulatingPaymentMediums(AccountHeadDto obj)
        {
            await LoadAllPaymentMediums();
        }

        private async Task EditDetail(int id)
        {
            try
            {
                var accountHead = await _accountHeadRepo.Get(id);
                var dto = new AccountHeadDto
                {
                    Id = accountHead.Id,
                    Name = accountHead.Name,
                    Code = accountHead.Code,
                    HeadType = accountHead.Type,
                    LedgerType = accountHead.LedgerType
                };

                await OpenAccountHeadModal(dto);
            }
            catch (Exception)
            {
                _toastService.LongAlert("Failed to edit payment medium");
            }

        }

        private async Task Disable(int id)
        {
            try
            {
                var isDeleteConfirmed = await _notificationService.ShowConfirmationDialog("Confirm!!", "Are you sure to delete this entry?", "OK", "Cancel");
                if (!isDeleteConfirmed)
                    return;
                await _accountHeadService.Disable(id);
                AfterManipulatingPaymentMediums(null);
            }
            catch (Exception)
            {
                _toastService.LongAlert("Failed to delete payment medium.");
            }

        }
    }
}
