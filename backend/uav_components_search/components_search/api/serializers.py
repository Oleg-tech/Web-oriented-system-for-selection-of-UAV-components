from rest_framework import serializers


class ComponentSerializer(serializers.Serializer):
    componentName = serializers.CharField()
    componentPrice = serializers.CharField()
    componentImageURL = serializers.URLField()
    componentExternalURL = serializers.URLField()
    componentShopName = serializers.CharField()
    componentCountry = serializers.CharField(default=None)
