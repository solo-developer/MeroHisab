using MeroHisab.Core.Dto;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Partial.AccountHead;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.CommunityToolkit.UI.Views;
using Xamarin.Forms;

namespace MeroHisab.ViewModels
{
    public class AccountHeadListPageModel : ViewModelBase
    {
        private readonly IAccountHeadService _accountHeadService;
        public IAsyncCommand AddAccountHeadCommand { get; set; }
        public AccountHeadListPageModel(IAccountHeadService accountHeadService)
        {
            _accountHeadService = accountHeadService;
            AccountHeads = new ObservableRangeCollection<AccountHeadDto>();
            AddAccountHeadCommand = new AsyncCommand(() => OpenAccountHeadModal(), a => true);
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
        public LayoutState PaymentMediumDataState
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
                AccountHeads.Clear();
                var heads = await _accountHeadService.GetAccountHeads(Core.Enums.LedgerType.Normal);
                AccountHeads.AddRange(heads);

                AccountHeadDataState = LayoutState.Success;
            }
            catch (System.Exception)
            {
                AccountHeadDataState = LayoutState.Error;
            }
        }

        private async Task OpenAccountHeadModal()
        {
            await _navigationService.ShowModal(new AddEditAccountHeadModal(new AccountHeadDto() { LedgerType = Core.Enums.LedgerType.Normal }));

            MessagingCenter.Subscribe<AccountHeadDto>(this, "AccountHeadSavedUpdated", AfterManipulatingAccountHeads);
        }

        private async void AfterManipulatingAccountHeads(AccountHeadDto obj)
        {
            await LoadAllAccountHeads();
        }
    }
}
