using MeroHisab.Core.Attributes;
using MeroHisab.Core.Dto;
using MeroHisab.Core.Enums;
using MeroHisab.Core.Extensions;
using MeroHisab.Core.Services.Interface;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;

namespace MeroHisab.ViewModels
{
    public class AccountKeysModel
    {
        public string Key { get; set; }
        public LedgerGroupType GroupType { get; set; }
    }
    public class DefaultAccountSetupPageModel : ViewModelBase
    {
        private readonly ILedgerSetupService _ledgerSetupService;
        private readonly ILedgerService _ledgerService;
        public DefaultAccountSetupPageModel(ILedgerSetupService ledgerSetupService, ILedgerService ledgerService)
        {
            _ledgerSetupService = ledgerSetupService;
            _ledgerService = ledgerService;
            AccountKeys = new ObservableRangeCollection<AccountKeysModel>();
            Setups = new ObservableRangeCollection<LedgerSetupDto>();
            Ledgers = new ObservableRangeCollection<LedgerDto>();
            SetAccountKeys();
            LoadSetups();
            LoadLedgers();
        }

        public ObservableRangeCollection<AccountKeysModel> AccountKeys
        {
            get => GetValue<ObservableRangeCollection<AccountKeysModel>>();
            set
            {
                SetValue(value);
            }
        }

        public ObservableRangeCollection<LedgerDto> Ledgers
        {
            get => GetValue<ObservableRangeCollection<LedgerDto>>();
            set
            {
                SetValue(value);
            }
        }
        public ObservableRangeCollection<LedgerSetupDto> Setups
        {
            get => GetValue<ObservableRangeCollection<LedgerSetupDto>>();
            set
            {
                SetValue(value);
            }
        }

        private async Task LoadLedgers()
        {
            var ledgers = await _ledgerService.GetAllLedgersAsync();
            Ledgers.Clear();
            Ledgers.AddRange(ledgers);
        }

        private async Task LoadSetups()
        {
            var setups = await _ledgerSetupService.GetAllAsync();
            Setups.Clear();
            Setups.AddRange(setups);
        }
        private void SetAccountKeys()
        {
            var keys = Enum.GetValues(typeof(LedgerSetupType))
                .Cast<LedgerSetupType>()
                .Select(s => new AccountKeysModel
                {
                    Key = s.GetDisplayName(),
                    GroupType = (s.GetAttribute<LedgerGroupAttribute>()).GroupType
                }).OrderBy(a => a.Key).ToList();

            AccountKeys.Clear();
            AccountKeys.AddRange(keys);
        }
    }
}
