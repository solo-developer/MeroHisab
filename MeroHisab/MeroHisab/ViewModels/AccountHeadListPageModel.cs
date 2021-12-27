using MeroHisab.Core.Dto;
using MeroHisab.Core.Services.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.CommunityToolkit.UI.Views;

namespace MeroHisab.ViewModels
{
    public class AccountHeadListPageModel : ViewModelBase
    {
        private readonly IAccountHeadService _accountHeadService;
        public AccountHeadListPageModel(IAccountHeadService accountHeadService)
        {
            _accountHeadService = accountHeadService;
            AccountHeads = new ObservableRangeCollection<AccountHeadDto>();
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
                var heads = await _accountHeadService.GetAccountHeads(Core.Enums.LedgerType.Normal, 3);
                AccountHeads.AddRange(heads);

                AccountHeadDataState = LayoutState.Success;
            }
            catch (System.Exception)
            {
                AccountHeadDataState = LayoutState.Error;
            }
        }
    }
}
