﻿using MeroHisab.Core.Dto;
using MeroHisab.Core.Enums;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Helpers.Implementations;
using MeroHisab.Helpers.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MeroHisab.ViewModels
{
    public class AccountHeadViewModel : ViewModelBase
    {
        public IAsyncCommand SaveButtonClickedCommand { get; set; }
        public IAsyncCommand CancelButtonClickedCommand { get; set; }

        private readonly IAccountHeadService _accountHeadService;
        private readonly INotificationService _notificationService;
        public Page page;
        public AccountHeadViewModel(IAccountHeadService accountHeadService, INotificationService notificationService)
        {
            SaveButtonClickedCommand = new AsyncCommand(Proceed);
            CancelButtonClickedCommand = new AsyncCommand(Cancel, () => true);
            PayHeadTypes = new ObservableRangeCollection<GenericDropDownDto<int, string>>();
            _accountHeadService = accountHeadService;
            _notificationService = notificationService;
        }

        public bool IsPaymentMedium
        {
            get => GetValue<bool>();
            set => SetValue(value);
        }

        public AccountHeadDto Model
        {
            get => GetValue<AccountHeadDto>();
            set => SetValue(value);
        }
        public ObservableRangeCollection<GenericDropDownDto<int, string>> PayHeadTypes
        {
            get => GetValue<ObservableRangeCollection<GenericDropDownDto<int, string>>>();
            set
            {
                SetValue(value);
            }
        }

        public GenericDropDownDto<int, string> SelectedPayHead
        {
            get => GetValue<GenericDropDownDto<int, string>>();
            set
            {
                SetValue(value);
            }
        }
        private async Task Proceed()
        {
            try
            {
                if (!ValidationHelper.IsFormValid(Model, page))
                    return;
                Model.HeadType = (LedgerGroupType)SelectedPayHead.Value;

                await _accountHeadService.SaveOrUpdate(Model);

                await _notificationService.ShowInfo("Success", "Operation performed successfully.");
                await _navigationService.HideModal();
                string key = "AccountHeadSavedUpdated";
                if(Model.LedgerType == LedgerType.PaymentMedium)
                {
                    key = "PaymentMediumSavedUpdated";
                }
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

        public void SetValues(AccountHeadDto dto)
        {
            Model = dto;
            var heads = Enum.GetValues(typeof(LedgerGroupType))
                   .Cast<LedgerGroupType>().Select(a => new GenericDropDownDto<int, string>
                   {
                       Text = a.ToString(),
                       Value = (int)a
                   }).ToList();
            PayHeadTypes.Clear();
            PayHeadTypes.AddRange(heads);
            SelectedPayHead = PayHeadTypes.FirstOrDefault(a => a.Value == (int)dto.HeadType);
            IsPaymentMedium = dto.LedgerType == LedgerType.PaymentMedium;
        }
    }
}
