namespace MeroHisab.Core.Dto
{
    public class GenericDropDownDto<T, TY>
    {
        public T Value { get; set; }
        public TY Text { get; set; }
    }
}
