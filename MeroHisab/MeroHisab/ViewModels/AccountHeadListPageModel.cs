using MeroHisab.Core.BaseRepository.Interface;
using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Repository.Interface;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Helpers.Interface;
using MeroHisab.Partial.AccountHead;
using System;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.CommunityToolkit.UI.Views;
using Xamarin.Forms;

namespace MeroHisab.ViewModels
{
    public class AccountHeadListPageModel : ViewModelBase
    {
        private readonly IAccountHeadService _accountHeadService;
        private readonly IBaseRepository<AccountHead> _accountHeadRepo;
        private readonly INotificationService _notificationService;

        public IAsyncCommand AddAccountHeadCommand { get; set; }
        public ICommand OnEditButtonClicked { get; set; }
        public ICommand OnDeleteButtonClicked { get; set; }
        public AccountHeadListPageModel(IAccountHeadService accountHeadService, IBaseRepository<AccountHead> accountHeadRepo, INotificationService notificationService)
        {
            _accountHeadService = accountHeadService;
            _accountHeadRepo = accountHeadRepo;
            AccountHeads = new ObservableRangeCollection<AccountHeadDto>();
            AddAccountHeadCommand = new AsyncCommand(() => OpenAccountHeadModal(new AccountHeadDto() { LedgerType = Core.Enums.LedgerType.Normal }), a => true);
            OnEditButtonClicked = new Command<int>(async (id) => await EditDetail(id), a => true);
            OnDeleteButtonClicked = new Command<int>(async (id) => await Disable(id), a => true);

            _notificationService = notificationService;
            LoadAllAccountHeads();
        }

        public LayoutState AccountHeadDataState
        {
            get => GetValue<LayoutState>();
            set
            {
                SetValue(value);
            }
        }

        public ObservableRangeCollection<AccountHeadDto> AccountHeads
        {
            get => GetValue<ObservableRangeCollection<AccountHeadDto>>();
            set
            {
                SetValue(value);
            }
        }

        private async Task LoadAllAccountHeads()
        {
            try
            {
                AccountHeadDataState = LayoutState.Loading;
                AccountHeads = new ObservableRangeCollection<AccountHeadDto>();
                var heads = await _accountHeadService.GetAccountHeads(Core.Enums.LedgerType.Normal);
                AccountHeads.AddRange(heads);

                AccountHeadDataState = LayoutState.Success;
            }
            catch (System.Exception)
            {
                AccountHeadDataState = LayoutState.Error;
            }
        }

        private async Task OpenAccountHeadModal(AccountHeadDto dto)
        {
            await _navigationService.ShowModal(new AddEditAccountHeadModal(dto));

            MessagingCenter.Subscribe<AccountHeadDto>(this, "AccountHeadSavedUpdated", AfterManipulatingAccountHeads);
        }

        private async void AfterManipulatingAccountHeads(AccountHeadDto obj)
        {
            await LoadAllAccountHeads();
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
                    HeadType = accountHead.HeadType,
                    LedgerType = accountHead.LedgerType
                };

                await OpenAccountHeadModal(dto);
            }
            catch (Exception)
            {
                _toastService.LongAlert("Failed to edit account head");
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
                AfterManipulatingAccountHeads(null);
            }
            catch (Exception)
            {
                _toastService.LongAlert("Failed to delete account head.");
            }

        }
    }
}
